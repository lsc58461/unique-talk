/* eslint-disable no-underscore-dangle */
'use client'

import { Loader2, Plus } from 'lucide-react'
import Image from 'next/image'
import { useTransitionRouter } from 'next-view-transitions'
import { useState } from 'react'

import { ChatRoomList } from '@/features/chat/components/chat-room-list'
import { useChat } from '@/features/chat/hooks/use-chat'
import { Header } from '@/shared/components/header/header'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { ConfirmModal } from '@/shared/components/modal/confirm-modal'
import { useModal } from '@/shared/hooks/use-modal'
import { IChatRoom } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

export function ChatListView() {
  const router = useTransitionRouter()
  const { rooms, isLoading, handleDeleteRoom, user } = useChat()

  const { isModalOpen, openModal, closeModal } = useModal()
  const [roomToDelete, setRoomToDelete] = useState<IChatRoom | null>(null)

  const onRoomDeleteClick = (roomId: string) => {
    const room = rooms.find((r) => r._id?.toString() === roomId)
    if (room) {
      setRoomToDelete(room)
      openModal()
    }
  }

  const onRoomSelect = (roomId: string) => {
    router.push(`/chat/${roomId}`)
  }

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

  return (
    <PageLayout>
      <div className={cn('flex h-full flex-col bg-pink-50/20')}>
        <Header
          left={
            <Header.Title className={cn('text-2xl text-pink-500')}>
              Uni<span className={cn('text-[8px]')}>que</span>Talk
            </Header.Title>
          }
          right={
            <div className={cn('flex items-center gap-3')}>
              {user.image && (
                <button
                  onClick={() => router.push('/chat/profile')}
                  className={cn(
                    'relative size-8 overflow-hidden rounded-full border border-pink-100 shadow-sm transition-transform active:scale-90',
                  )}
                  type="button"
                >
                  <Image
                    src={user.image}
                    alt={user.name || '프로필'}
                    fill
                    className={cn('object-cover')}
                  />
                </button>
              )}
              <button
                onClick={() => router.push('/chat/select-character')}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full bg-pink-500 text-white shadow-md transition-all active:scale-90',
                )}
                type="button"
              >
                <Plus className={cn('size-6')} />
              </button>
            </div>
          }
        />

        <div className={cn('flex-1 overflow-y-auto')}>
          <ChatRoomList
            rooms={rooms}
            onRoomSelect={onRoomSelect}
            onRoomDelete={onRoomDeleteClick}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={() => {
          if (roomToDelete?._id) {
            handleDeleteRoom(roomToDelete._id.toString())
          }
          closeModal()
        }}
        title="채팅방 삭제"
        description={`'${roomToDelete?.name}' 대화방을 삭제하시겠습니까? 삭제된 대화는 복구할 수 없습니다.`}
        confirmText="삭제하기"
        isDestructive
      />
    </PageLayout>
  )
}
