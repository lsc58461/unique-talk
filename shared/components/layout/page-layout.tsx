'use client'

import { cn } from '@/shared/utils/cn'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export function PageLayout({
  children,
  className,
  containerClassName,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen justify-center bg-gray-100',
        containerClassName,
      )}
    >
      <main
        className={cn(
          'relative flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-white shadow-2xl',
          className,
        )}
      >
        {children}
      </main>
    </div>
  )
}
