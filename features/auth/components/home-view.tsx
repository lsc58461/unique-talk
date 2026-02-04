'use client'

import { Loader2 } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'
import { useEffect } from 'react'

import { useChat } from '@/features/chat/hooks/use-chat'
import { cn } from '@/shared/utils/cn'

export function HomeView() {
  const router = useTransitionRouter()
  const { user, isLoading } = useChat()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/chat')
      } else {
        router.replace('/auth/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div
      className={cn('flex min-h-screen items-center justify-center bg-pink-50')}
    >
      <Loader2
        className={cn('animate-spin text-base font-medium text-pink-500')}
      />
    </div>
  )
}
