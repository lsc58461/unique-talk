/* eslint-disable no-underscore-dangle */
'use client'

import dayjs from 'dayjs'
import { Heart, MessageCircle, Shield, Trash2, Zap } from 'lucide-react'
import Image from 'next/image'

import { IChatRoom } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

interface ChatRoomListProps {
  rooms: IChatRoom[]
  onRoomSelect: (roomId: string) => void
  onRoomDelete: (roomId: string) => void
}

const CHARACTER_TYPE_LABEL: Record<string, string> = {
  obsessive: '집착',
  tsundere: '츤데레',
  pure: '순정',
  makjang: '막장',
  younger_powerful: '박력연하',
  younger_cute: '큐티연하',
  older_sexy: '섹시연상',
}

export function ChatRoomList({
  rooms,
  onRoomSelect,
  onRoomDelete,
}: ChatRoomListProps) {
  return (
    <div className={cn('flex flex-col gap-2 p-4')}>
      <h2 className={cn('mb-4 text-xl font-bold text-pink-600')}>채팅 목록</h2>
      {rooms.length === 0 ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center py-20 text-gray-400',
          )}
        >
          <MessageCircle className={cn('mb-2 size-12 opacity-20')} />
          <p className={cn('text-sm')}>새로운 대화를 시작해보세요!</p>
        </div>
      ) : (
        rooms.map((room) => (
          <div
            key={room._id?.toString()}
            onClick={() => onRoomSelect(room._id!.toString())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRoomSelect(room._id!.toString())
              }
            }}
            role="button"
            tabIndex={0}
            className={cn(
              'flex cursor-pointer items-center gap-4 rounded-2xl border border-pink-100 bg-white p-4 transition-all hover:border-pink-300 hover:shadow-md active:scale-[0.98]',
            )}
          >
            <div
              className={cn(
                'relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm',
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

            <div className={cn('flex flex-1 flex-col overflow-hidden')}>
              <div className={cn('flex items-center justify-between')}>
                <div className={cn('flex items-center gap-1.5')}>
                  <span className={cn('text-base font-bold text-gray-800')}>
                    {room.name}
                  </span>
                  <span
                    className={cn('text-[11px] font-medium opacity-60')}
                    style={{ color: room.color }}
                  >
                    ({CHARACTER_TYPE_LABEL[room.characterType]})
                  </span>
                </div>
                <span className={cn('text-[11px] text-gray-400')}>
                  {dayjs(room.updatedAt).format('MM/DD HH:mm')}
                </span>
              </div>
              <p className={cn('truncate text-sm text-gray-500')}>
                {room.lastMessage || '대화를 시작해보세요.'}
              </p>
              <div className={cn('mt-1 flex gap-2')}>
                <div className={cn('flex items-center gap-1 text-[10px]')}>
                  <Heart
                    className={cn('size-2.5')}
                    style={{ color: room.color }}
                  />
                  <span style={{ color: room.color }}>
                    {room.state.affection.toFixed(2)}%
                  </span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] text-purple-400',
                  )}
                >
                  <Zap className={cn('size-2.5')} />
                  <span>{room.state.jealousy.toFixed(2)}%</span>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] text-blue-400',
                  )}
                >
                  <Shield className={cn('size-2.5')} />
                  <span>{room.state.trust.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRoomDelete(room._id!.toString())
              }}
              className={cn(
                'rounded-full p-2 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500',
              )}
            >
              <Trash2 className={cn('size-[18px]')} />
            </button>
          </div>
        ))
      )}
    </div>
  )
}
