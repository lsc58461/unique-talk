'use client'

import dayjs from 'dayjs'
import { Send, ArrowLeft, Heart, Shield, Zap, Lock, Unlock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { Header } from '@/shared/components/header/header'
import { IChatRoom, IMessage, IState } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

interface ChatViewProps {
  room: IChatRoom
  messages: IMessage[]
  onSendMessage: (content: string) => void
  onBack: () => void
  onToggleAdultMode: () => void
  isSending?: boolean
}

interface GaugeBarProps {
  label: string
  value: number
  color: string
  icon: any
}

function GaugeBar({ label, value, color, icon: GaugeIcon }: GaugeBarProps) {
  return (
    <div className={cn('flex flex-1 flex-col gap-1')}>
      <div className={cn('flex items-center justify-between px-1')}>
        <div
          className={cn('flex items-center gap-1 text-[10px] font-bold')}
          style={{ color }}
        >
          <GaugeIcon className={cn('size-2.5')} />
          <span>{label}</span>
        </div>
        <span className={cn('text-[10px] font-medium text-gray-400')}>
          {value.toFixed(2)}%
        </span>
      </div>
      <div
        className={cn('h-1.5 w-full overflow-hidden rounded-full bg-gray-100')}
      >
        <div
          className={cn('h-full transition-all duration-500')}
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function ChatView({
  room,
  messages,
  onSendMessage,
  onBack,
  onToggleAdultMode,
  isSending = false,
}: ChatViewProps) {
  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastStateRef = useRef<IState | null>(null)
  const [showFeedback, setShowFeedback] = useState<{
    label: string
    delta: number
    color: string
  } | null>(null)

  useEffect(() => {
    if (lastStateRef.current) {
      const affectionDelta =
        room.state.affection - lastStateRef.current.affection
      if (affectionDelta !== 0) {
        setShowFeedback({
          label: affectionDelta > 0 ? '호감도 상승!' : '호감도 하락...',
          delta: affectionDelta,
          color: affectionDelta > 0 ? 'text-pink-500' : 'text-gray-500',
        })
        setTimeout(() => setShowFeedback(null), 2000)
      }
    }
    lastStateRef.current = { ...room.state }
  }, [room.state])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || isSending || isComposing) return
    onSendMessage(inputValue)
    setInputValue('')
  }

  return (
    <div className={cn('flex h-full flex-col bg-white')}>
      <Header
        left={
          <div className={cn('flex items-center gap-3')}>
            <button
              onClick={onBack}
              className={cn(
                'rounded-full p-2 transition-colors hover:bg-gray-100',
              )}
              type="button"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className={cn('size-5 text-gray-600')} />
            </button>
            <div className={cn('flex items-center gap-3')}>
              <div
                className={cn(
                  'relative flex size-10 items-center justify-center overflow-hidden rounded-full shadow-sm',
                )}
                style={{ backgroundColor: room.bgColor }}
              >
                <Image
                  src={room.imageUrl}
                  alt={room.name}
                  fill
                  className={cn('object-cover')}
                />
              </div>
              <Header.Title>{room.name}</Header.Title>
            </div>
          </div>
        }
        right={
          <button
            onClick={onToggleAdultMode}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
              room.isAdultMode
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
            type="button"
            aria-label="모드 전환"
          >
            {room.isAdultMode ? (
              <>
                <Lock className={cn('size-3')} />
                <span>19금</span>
              </>
            ) : (
              <>
                <Unlock className={cn('size-3')} />
                <span>일반</span>
              </>
            )}
          </button>
        }
        bottom={
          <div
            className={cn('relative flex gap-3 bg-gray-50/50 px-6 pt-2 pb-4')}
          >
            <GaugeBar
              label="호감"
              value={room.state.affection}
              color="#ec4899"
              icon={Heart}
            />
            <GaugeBar
              label="질투"
              value={room.state.jealousy}
              color="#a855f7"
              icon={Zap}
            />
            <GaugeBar
              label="신뢰"
              value={room.state.trust}
              color="#3b82f6"
              icon={Shield}
            />

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 0, x: '-50%' }}
                  animate={{ opacity: 1, y: -40, x: '-50%' }}
                  exit={{ opacity: 0, y: -60, x: '-50%' }}
                  className={cn(
                    'pointer-events-none absolute top-0 left-1/2 py-1 text-xs font-bold shadow-sm',
                  )}
                  style={{
                    color:
                      showFeedback.color === 'text-pink-500'
                        ? '#ec4899'
                        : '#6b7280',
                  }}
                >
                  {showFeedback.label} {showFeedback.delta > 0 ? '+' : ''}
                  {showFeedback.delta}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* Messages */}
      <div className={cn('flex-1 overflow-y-auto bg-gray-50/30 p-4')}>
        <div className={cn('flex flex-col gap-4')}>
          {messages.map((msg, index) => {
            const isAssistant = msg.role === 'assistant'
            const currentMsgDate = dayjs(msg.createdAt).format('M월 D일')
            const prevMsgDate =
              index > 0
                ? dayjs(messages[index - 1].createdAt).format('M월 D일')
                : null
            const isNewDay = currentMsgDate !== prevMsgDate

            return (
              <div
                // eslint-disable-next-line no-underscore-dangle
                key={msg._id?.toString() || `msg-${index}`}
                className={cn('flex flex-col gap-4')}
              >
                {isNewDay && (
                  <div className={cn('my-6 flex items-center justify-center')}>
                    <div className={cn('h-px flex-1 bg-gray-200')} />
                    <span
                      className={cn(
                        'mx-4 text-[11px] font-semibold text-gray-400',
                      )}
                    >
                      ─── {currentMsgDate} ───
                    </span>
                    <div className={cn('h-px flex-1 bg-gray-200')} />
                  </div>
                )}
                <div
                  className={cn(
                    'flex w-full flex-col gap-1',
                    isAssistant ? 'items-start' : 'items-end',
                  )}
                >
                  <div
                    className={cn(
                      'flex w-full',
                      isAssistant ? 'justify-start' : 'justify-end',
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={cn(
                        'flex items-end gap-1.5',
                        !isAssistant && 'flex-row-reverse',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                          isAssistant
                            ? 'rounded-tl-none border border-gray-100 bg-white text-gray-800'
                            : 'rounded-tr-none text-white',
                        )}
                        style={{
                          backgroundColor: !isAssistant
                            ? room.color
                            : undefined,
                        }}
                      >
                        {isAssistant ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <span
                        className={cn(
                          'mb-1 shrink-0 text-[10px] text-gray-400',
                        )}
                      >
                        {dayjs(msg.createdAt).format('HH:mm')}
                      </span>
                    </motion.div>
                  </div>

                  {/* 상태 변화량 표시 (내가 보낸 메시지에 대한 AI의 응답 결과로 간주하여 내 메시지 아래 표시하거나, 
                      혹은 AI 메시지에 포함된 delta를 표시) - 요청에 따라 '내가 보낸 채팅 밑에' 표시 */}
                  {!isAssistant && msg.stateDelta && (
                    <div className={cn('flex items-center gap-2 px-1')}>
                      {msg.stateDelta.affection !== undefined &&
                        msg.stateDelta.affection !== 0 && (
                          <div
                            className={cn(
                              'flex items-center gap-0.5 text-[10px] font-bold text-pink-500',
                            )}
                          >
                            <Heart
                              className={cn('size-2.5')}
                              fill="currentColor"
                            />
                            <span>
                              {msg.stateDelta.affection > 0 ? '+' : ''}
                              {msg.stateDelta.affection}
                            </span>
                          </div>
                        )}
                      {msg.stateDelta.jealousy !== undefined &&
                        msg.stateDelta.jealousy !== 0 && (
                          <div
                            className={cn(
                              'flex items-center gap-0.5 text-[10px] font-bold text-purple-500',
                            )}
                          >
                            <Zap
                              className={cn('size-2.5')}
                              fill="currentColor"
                            />
                            <span>
                              {msg.stateDelta.jealousy > 0 ? '+' : ''}
                              {msg.stateDelta.jealousy}
                            </span>
                          </div>
                        )}
                      {msg.stateDelta.trust !== undefined &&
                        msg.stateDelta.trust !== 0 && (
                          <div
                            className={cn(
                              'flex items-center gap-0.5 text-[10px] font-bold text-blue-500',
                            )}
                          >
                            <Shield
                              className={cn('size-2.5')}
                              fill="currentColor"
                            />
                            <span>
                              {msg.stateDelta.trust > 0 ? '+' : ''}
                              {msg.stateDelta.trust}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isSending &&
            (!messages.length ||
              messages[messages.length - 1].role !== 'assistant' ||
              !messages[messages.length - 1].content) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex justify-start')}
              >
                <div
                  className={cn(
                    'rounded-2xl rounded-tl-none border border-gray-100 bg-white px-4 py-3 shadow-sm',
                  )}
                >
                  <div className={cn('flex gap-1')}>
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className={cn('size-1.5 rounded-full bg-gray-300')}
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className={cn('size-1.5 rounded-full bg-gray-300')}
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className={cn('size-1.5 rounded-full bg-gray-300')}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <footer className={cn('bg-white p-4 pb-6')}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-3xl border border-gray-100 bg-gray-50 p-2 pl-4 transition-all focus-within:border-pink-300 focus-within:bg-white focus-within:shadow-md',
          )}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isComposing) {
                handleSend()
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={
              isSending
                ? `${room.name}님이 답변을 생각 중이에요...`
                : `${room.name}에게 메시지를 보내보세요...`
            }
            className={cn(
              'flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400',
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-90 disabled:bg-gray-300 disabled:shadow-none',
            )}
            style={{
              backgroundColor:
                inputValue.trim() && !isSending ? room.color : undefined,
            }}
            type="button"
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={cn(
                  'size-4 rounded-full border-2 border-white border-t-transparent',
                )}
              />
            ) : (
              <Send className={cn('size-[18px]')} />
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
