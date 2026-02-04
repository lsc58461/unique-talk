'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Modal } from '@/shared/components/modal/modal'
import { Portal } from '@/shared/components/portal/portal'
import { useModal } from '@/shared/hooks/use-modal'
import { CharacterType } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

interface CharacterNameInputModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
  characterType: CharacterType | null
  imageUrl?: string
  title?: string
  color?: string
  bgColor?: string
}

export function CharacterNameInputModal({
  isOpen,
  onClose,
  onCreate,
  characterType,
  imageUrl,
  title,
  color,
  bgColor,
}: CharacterNameInputModalProps) {
  const { dimRef } = useModal()
  const [name, setName] = useState('')

  if (!characterType) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim())
    setName('')
    onClose()
  }

  return (
    <Portal isPortalOpen={isOpen}>
      <Modal.Dim dimRef={dimRef} onDimClick={onClose}>
        <Modal>
          <Modal.Header text={`${title} 연인의 이름`} onCloseClick={onClose} />
          <div
            className={cn(
              'relative flex flex-col items-center p-8 pt-2 text-center',
            )}
          >
            <div
              className={cn(
                'mb-6 flex size-20 items-center justify-center overflow-hidden rounded-4xl shadow-inner',
              )}
              style={{ backgroundColor: bgColor || '#F9FAFB' }}
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={title || '캐릭터 이미지'}
                  width={80}
                  height={80}
                  className={cn('size-full object-cover')}
                />
              )}
            </div>

            <p
              className={cn('mb-8 px-4 text-xs leading-relaxed text-gray-400')}
            >
              상대방에게 어울리는 이름을 지어주세요.
              <br />
              이름은 나중에 변경할 수 없어요.
            </p>

            <form
              onSubmit={handleSubmit}
              className={cn('flex w-full flex-col gap-4')}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="원하는 이름을 입력해주세요."
                maxLength={10}
                className={cn(
                  'h-14 w-full rounded-2xl border-2 border-transparent bg-gray-50 px-6 text-center text-base font-medium text-gray-800 transition-all outline-none focus:bg-white',
                )}
                style={{
                  borderColor: name.trim() ? color : 'transparent',
                }}
              />

              <button
                disabled={!name.trim()}
                type="submit"
                className={cn(
                  'h-14 w-full rounded-2xl text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:shadow-none disabled:grayscale',
                )}
                style={{
                  background: name.trim()
                    ? `linear-gradient(to right, ${bgColor}, ${color})`
                    : undefined,
                  backgroundColor: !name.trim() ? '#E5E7EB' : undefined,
                  boxShadow: name.trim()
                    ? `0 10px 15px -3px ${color}40`
                    : 'none',
                }}
              >
                대화 시작하기
              </button>
            </form>
          </div>
        </Modal>
      </Modal.Dim>
    </Portal>
  )
}
