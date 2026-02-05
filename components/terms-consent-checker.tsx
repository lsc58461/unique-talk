'use client'

import { ModalTermsConsent } from '@/components/modal/modal-terms-consent'
import { useTermsConsent } from '@/shared/hooks/use-terms-consent'

export function TermsConsentChecker() {
  const { needsConsent, isChecking, handleConsent } = useTermsConsent()

  // 체크 중이거나 동의가 필요하지 않으면 아무것도 렌더링하지 않음
  if (isChecking || !needsConsent) {
    return null
  }

  return <ModalTermsConsent isOpen={needsConsent} onConsent={handleConsent} />
}
