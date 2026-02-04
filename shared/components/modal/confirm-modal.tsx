'use client'

import { Portal } from '@/shared/components/portal/portal'
import { useModal } from '@/shared/hooks/use-modal'
import { cn } from '@/shared/utils/cn'

import { Modal } from './modal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  const { dimRef } = useModal()

  return (
    <Portal isPortalOpen={isOpen}>
      <Modal.Dim dimRef={dimRef} onDimClick={onClose}>
        <Modal>
          <Modal.Header text={title} onCloseClick={onClose} />
          <div className={cn('flex flex-col gap-6 p-6')}>
            <p
              className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap text-gray-500',
              )}
            >
              {description}
            </p>
            <div className={cn('flex gap-3')}>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200',
                )}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm()
                }}
                disabled={isLoading}
                className={cn(
                  'flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-95',
                  isDestructive
                    ? 'bg-red-500 shadow-lg shadow-red-100 hover:bg-red-600'
                    : 'bg-pink-500 shadow-lg shadow-pink-100 hover:bg-pink-600',
                  isLoading && 'opacity-50',
                )}
              >
                {isLoading ? '처리 중...' : confirmText}
              </button>
            </div>
          </div>
        </Modal>
      </Modal.Dim>
    </Portal>
  )
}
