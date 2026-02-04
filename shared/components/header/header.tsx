'use client'

import { cn } from '@/shared/utils/cn'

interface HeaderProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  bottom?: React.ReactNode
  className?: string
  containerClassName?: string
}

export function Header({
  left,
  center,
  right,
  bottom,
  className,
  containerClassName,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col border-b border-b-pink-200 bg-white',
        containerClassName,
      )}
    >
      <div
        className={cn(
          'relative flex h-18 items-center justify-between px-6',
          className,
        )}
      >
        {/* Left Section */}
        <div className={cn('flex items-center gap-4')}>
          {left && (
            <div className={cn('flex shrink-0 items-center')}>{left}</div>
          )}
        </div>

        {/* Center Section (Absolute Centering) */}
        {center && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 flex justify-center',
            )}
          >
            <div className={cn('pointer-events-auto')}>{center}</div>
          </div>
        )}

        {/* Right Section */}
        <div className={cn('flex items-center gap-2')}>
          {right && (
            <div className={cn('flex shrink-0 items-center gap-2')}>
              {right}
            </div>
          )}
        </div>
      </div>
      {bottom && <div className={cn('w-full')}>{bottom}</div>}
    </header>
  )
}

function Title({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h1 className={cn('truncate text-lg font-bold text-gray-800', className)}>
      {children}
    </h1>
  )
}

Header.Title = Title
