/* eslint-disable no-underscore-dangle */
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { IChatRoom, IMessage } from '@/shared/types/database'

export function useChat() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [rooms, setRooms] = useState<IChatRoom[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const selectedRoom = rooms.find((r) => r._id?.toString() === selectedRoomId)

  const fetchRooms = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      } else {
        toast.error('대화 목록을 불러오지 못했습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
      toast.error('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?chatRoomId=${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.reverse())
      } else {
        toast.error('메시지를 불러오지 못했습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('네트워크 오류가 발생했습니다.')
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user) {
      // @ts-ignore
      const userId = session.user.id
      if (userId) {
        fetchRooms(userId)
      } else {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
      setRooms([])
    }
  }, [status, session, fetchRooms])

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId)
    } else {
      setMessages([])
    }
  }, [selectedRoomId, fetchMessages])

  const handleLogout = () => {
    signOut()
    setSelectedRoomId(null)
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedRoomId || !selectedRoom || !user || isSending) return

    setIsSending(true)
    const tempUserMsg: IMessage = {
      chatRoomId: selectedRoomId as any,
      role: 'user',
      content,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await fetch('/api/chat/messages/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatRoomId: selectedRoomId,
          content,
          chatRoom: selectedRoom,
        }),
      })

      if (!res.ok) {
        throw new Error('Streaming failed')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6))

              if (data.content) {
                fullContent += data.content
                const currentContent = fullContent
                setMessages((prev) => {
                  const last = prev[prev.length - 1]
                  if (last && last.role === 'assistant' && !last._id) {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: currentContent },
                    ]
                  }
                  // 첫 번째 청크일 때 어시스턴트 메시지 생성
                  return [
                    ...prev,
                    {
                      chatRoomId: selectedRoomId as any,
                      role: 'assistant',
                      content: currentContent,
                      createdAt: new Date(),
                    },
                  ]
                })
              }

              if (data.done) {
                const { message, state, userMessageDelta } = data

                // 감정 변화 토스트 표시
                if (selectedRoom?.state && state) {
                  const { affection, jealousy, trust } = selectedRoom.state
                  const changes = []

                  if (state.affection > affection)
                    changes.push(`💖 호감도 +${state.affection - affection}`)
                  else if (state.affection < affection)
                    changes.push(`💔 호감도 ${state.affection - affection}`)

                  if (state.jealousy > jealousy)
                    changes.push(`⚡ 질투 +${state.jealousy - jealousy}`)
                  else if (state.jealousy < jealousy)
                    changes.push(`🍃 질투 ${state.jealousy - jealousy}`)

                  if (state.trust > trust)
                    changes.push(`🛡️ 신뢰 +${state.trust - trust}`)
                  else if (state.trust < trust)
                    changes.push(`⚠️ 신뢰 ${state.trust - trust}`)

                  if (changes.length > 0) {
                    const isPositive =
                      state.affection >= affection &&
                      state.trust >= trust &&
                      state.jealousy <= jealousy
                    const toastFn = isPositive ? toast.success : toast.info

                    toastFn(`${selectedRoom.name}님의 감정이 변화했습니다`, {
                      description: changes.join(' | '),
                    })
                  }
                }

                // 최종 메시지 및 상태 업데이트
                setMessages((prev) => {
                  // 유저 메시지 업데이트 (delta)
                  const updated = prev.map((msg) =>
                    msg === tempUserMsg
                      ? { ...msg, stateDelta: userMessageDelta }
                      : msg,
                  )
                  // AI 메시지 최종 업데이트 (ID 등 포함)
                  return [...updated.slice(0, -1), message]
                })

                setRooms((prev) =>
                  prev.map((r) =>
                    r._id?.toString() === selectedRoomId
                      ? {
                          ...r,
                          state,
                          lastMessage: message.content,
                          updatedAt: new Date(),
                        }
                      : r,
                  ),
                )
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to stream message:', error)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    // @ts-ignore
    if (!user?.id) return

    try {
      const res = await fetch(
        // @ts-ignore
        `/api/chat/rooms?roomId=${roomId}&userId=${user.id}`,
        {
          method: 'DELETE',
        },
      )

      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r._id?.toString() !== roomId))
        if (selectedRoomId === roomId) setSelectedRoomId(null)
        toast.success('채팅방이 삭제되었습니다.')
      } else {
        toast.error('채팅방 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete room:', error)
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleToggleAdultMode = async () => {
    if (!selectedRoomId || !selectedRoom) return

    try {
      const newMode = !selectedRoom.isAdultMode
      const res = await fetch('/api/chat/rooms/toggle-adult-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          isAdultMode: newMode,
        }),
      })

      if (res.ok) {
        setRooms((prev) =>
          prev.map((r) =>
            r._id?.toString() === selectedRoomId
              ? { ...r, isAdultMode: newMode }
              : r,
          ),
        )
        toast.success(
          newMode
            ? '19금 모드로 전환되었습니다.'
            : '일반 모드로 전환되었습니다.',
        )
      } else {
        toast.error('모드 전환에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to toggle adult mode:', error)
      toast.error('오류가 발생했습니다.')
    }
  }

  return {
    user,
    status,
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    messages,
    isLoading,
    isSending,
    handleLogout,
    handleSendMessage,
    handleDeleteRoom,
    handleToggleAdultMode,
  }
}
