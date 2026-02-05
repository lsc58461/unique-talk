'use client'

import { usePathname } from 'next/navigation'

import { ModalTermsConsent } from '@/components/modal/modal-terms-consent'
import { useTermsConsent } from '@/shared/hooks/use-terms-consent'

export function TermsConsentChecker() {
  const pathname = usePathname()
  const { needsConsent, isChecking, handleConsent } = useTermsConsent()

  // 약관 페이지에서는 동의 모달 표시 안 함
  const isTermsPage =
    pathname.startsWith('/terms') || pathname.startsWith('/privacy')

  // 체크 중이거나 동의가 필요하지 않거나 약관 페이지이면 아무것도 렌더링하지 않음
  if (isChecking || !needsConsent || isTermsPage) {
    return null
  }

  return <ModalTermsConsent isOpen={needsConsent} onConsent={handleConsent} />
}
