import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
import { Toaster } from 'sonner'

import { TermsConsentChecker } from '@/components/terms-consent-checker'
import { AuthProvider } from '@/shared/components/auth-provider'
import './globals.css'
import { cn } from '@/shared/utils/cn'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Unique Talk - 감정 기반 AI 채팅',
  description:
    '당신의 마음을 흔드는 AI와 달콤하고 치명적인 대화를 시작해보세요.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="ko">
        <body
          className={cn('antialiased h-screen overflow-hidden', geistSans.variable, geistMono.variable)}
        >
          <AuthProvider>
            {children}
            <TermsConsentChecker />
          </AuthProvider>
          <Toaster
            position="top-center"
            richColors
            duration={800}
            closeButton
          />
        </body>
      </html>
    </ViewTransitions>
  )
}
