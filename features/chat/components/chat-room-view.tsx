'use client'

import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'
import { useEffect } from 'react'

import { ChatView } from '@/features/chat/components/chat-view'
import { useChat } from '@/features/chat/hooks/use-chat'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { cn } from '@/shared/utils/cn'

export function ChatRoomView() {
  const { roomId } = useParams()
  const router = useTransitionRouter()
  const {
    rooms,
    selectedRoom,
    setSelectedRoomId,
    messages,
    isLoading,
    isSending,
    handleSendMessage,
    handleToggleAdultMode,
    user,
  } = useChat()

  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId as string)
    }
  }, [roomId, setSelectedRoomId])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center bg-pink-50',
        )}
      >
        <Loader2
          className={cn('animate-spin text-base font-medium text-pink-500')}
        />
      </div>
    )
  }

  if (!user) {
    router.replace('/auth/login')
    return null
  }

  if (!selectedRoom && !isLoading && rooms.length > 0) {
    // 만약 방을 찾을 수 없으면 목록으로 이동
    router.replace('/chat')
    return null
  }

  return (
    <PageLayout>
      {selectedRoom && (
        <ChatView
          room={selectedRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => router.push('/chat')}
          onToggleAdultMode={handleToggleAdultMode}
          isSending={isSending}
        />
      )}
    </PageLayout>
  )
}
