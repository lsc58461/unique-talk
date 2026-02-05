'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Modal } from '@/shared/components/modal/modal'
import { Portal } from '@/shared/components/portal/portal'
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from '@/shared/constants/terms-version'

interface ModalTermsConsentProps {
  isOpen: boolean
  onConsent: () => void
}

export function ModalTermsConsent({
  isOpen,
  onConsent,
}: ModalTermsConsentProps) {
  const dimRef = useRef<HTMLDivElement>(null)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)

  const allChecked = termsChecked && privacyChecked

  const handleAllCheck = () => {
    const newValue = !allChecked
    setTermsChecked(newValue)
    setPrivacyChecked(newValue)
  }

  const handleConsent = () => {
    if (allChecked) {
      onConsent()
    }
  }

  // 약관 동의는 필수이므로 닫기 불가
  const handleDimClick = () => {
    // 아무 동작 안 함
  }

  return (
    <Portal isPortalOpen={isOpen}>
      <Modal.Dim dimRef={dimRef} onDimClick={handleDimClick}>
        <Modal>
          <div className={cn('flex flex-col gap-6 p-6')}>
            <div className={cn('flex flex-col gap-3')}>
              <h2 className={cn('text-xl font-bold')}>약관 동의</h2>
              <p className={cn('text-sm text-gray-600')}>
                서비스 이용을 위해 약관에 동의해주세요.
              </p>
            </div>

            <div className={cn('flex flex-col gap-4')}>
              {/* 전체 동의 */}
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg border-2 border-gray-300 p-4',
                )}
              >
                <input
                  type="checkbox"
                  id="all-consent"
                  checked={allChecked}
                  onChange={handleAllCheck}
                  className={cn(
                    'h-5 w-5 cursor-pointer rounded border-2 border-gray-300 accent-blue-600',
                  )}
                />
                <label
                  htmlFor="all-consent"
                  className={cn(
                    'flex-1 cursor-pointer text-base font-semibold',
                  )}
                >
                  전체 동의
                </label>
              </div>

              {/* 개별 동의 */}
              <div className={cn('flex flex-col gap-3 pl-2')}>
                {/* 서비스 이용약관 */}
                <div className={cn('flex items-center gap-3')}>
                  <input
                    type="checkbox"
                    id="terms-consent"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className={cn(
                      'h-5 w-5 cursor-pointer rounded border-2 border-gray-300 accent-blue-600',
                    )}
                  />
                  <label
                    htmlFor="terms-consent"
                    className={cn('flex-1 cursor-pointer text-sm')}
                  >
                    [필수] 서비스 이용약관 동의 (v{TERMS_VERSION.version})
                  </label>
                  <Link
                    href="/terms"
                    target="_blank"
                    className={cn('text-xs text-blue-600 underline')}
                  >
                    보기
                  </Link>
                </div>

                {/* 개인정보 처리방침 */}
                <div className={cn('flex items-center gap-3')}>
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    checked={privacyChecked}
                    onChange={(e) => setPrivacyChecked(e.target.checked)}
                    className={cn(
                      'h-5 w-5 cursor-pointer rounded border-2 border-gray-300 accent-blue-600',
                    )}
                  />
                  <label
                    htmlFor="privacy-consent"
                    className={cn('flex-1 cursor-pointer text-sm')}
                  >
                    [필수] 개인정보 처리방침 동의 (v{PRIVACY_VERSION.version})
                  </label>
                  <Link
                    href="/privacy"
                    target="_blank"
                    className={cn('text-xs text-blue-600 underline')}
                  >
                    보기
                  </Link>
                </div>
              </div>
            </div>

            <div className={cn('flex flex-col gap-2')}>
              <Button
                onClick={handleConsent}
                disabled={!allChecked}
                className={cn(
                  'h-12 w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                동의하고 계속하기
              </Button>
              <p className={cn('text-center text-xs text-gray-500')}>
                약관에 동의하지 않으면 서비스를 이용할 수 없습니다.
              </p>
            </div>
          </div>
        </Modal>
      </Modal.Dim>
    </Portal>
  )
}
