/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

'use client'

import { X } from 'lucide-react'

import { cn } from '@/shared/utils/cn'

interface ModalProps {
  children: React.ReactNode
  className?: string
}

export function Modal({ children, className }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'animate-in fade-in zoom-in w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-2xl duration-200',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}

interface DimProps {
  children: React.ReactNode
  dimRef: React.RefObject<HTMLDivElement | null>
  onDimClick: () => void
}

function Dim({ children, dimRef, onDimClick }: DimProps) {
  return (
    <div
      ref={dimRef}
      role="presentation"
      className={cn(
        'fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm',
      )}
      onClick={onDimClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDimClick()
      }}
    >
      {children}
    </div>
  )
}

interface HeaderProps {
  text: string
  onCloseClick: () => void
}

function Header({ text, onCloseClick }: HeaderProps) {
  return (
    <div className={cn('relative flex items-center justify-center p-6')}>
      <h2 className={cn('text-lg font-bold text-gray-800')}>{text}</h2>
      <button
        onClick={onCloseClick}
        type="button"
        aria-label="닫기"
        className={cn(
          'absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100',
        )}
      >
        <X className={cn('size-5')} />
      </button>
    </div>
  )
}

Modal.Dim = Dim
Modal.Header = Header
