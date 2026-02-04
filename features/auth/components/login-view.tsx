'use client'

import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTransitionRouter } from 'next-view-transitions'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { KakaoLoginView } from '@/features/auth/components/kakao-login-view'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { cn } from '@/shared/utils/cn'

export function LoginView() {
  const { data: session, status } = useSession()
  const router = useTransitionRouter()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      toast.success(`${session.user?.name}님, 환영합니다!`)
      router.replace('/chat')
    }
  }, [status, session, router])

  if (status === 'loading') {
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

  return (
    <PageLayout>
      <KakaoLoginView />
    </PageLayout>
  )
}
