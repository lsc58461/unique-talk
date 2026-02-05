'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { checkTermsConsent, saveTermsConsent } from '@/services/terms.service'
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from '@/shared/constants/terms-version'

export function useTermsConsent() {
  const { data: session, status } = useSession()
  const [needsConsent, setNeedsConsent] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConsent = async () => {
      // 로그인하지 않은 경우 체크하지 않음
      if (status !== 'authenticated' || !session?.user) {
        console.info('약관 체크 스킵:', { status, hasUser: !!session?.user })
        setIsChecking(false)
        return
      }

      console.info('약관 동의 확인 시작:', {
        email: session.user.email,
        status,
      })

      try {
        const result = await checkTermsConsent()
        console.info('약관 동의 확인 결과:', result)
        setNeedsConsent(result.needsConsent)
      } catch (error) {
        console.error('약관 동의 확인 실패:', error)
        // 에러 발생 시 안전하게 동의 필요로 설정
        setNeedsConsent(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkConsent()
  }, [session, status])

  const handleConsent = async () => {
    try {
      await saveTermsConsent({
        termsVersion: TERMS_VERSION.version,
        privacyVersion: PRIVACY_VERSION.version,
      })
      setNeedsConsent(false)
    } catch (error) {
      console.error('약관 동의 저장 실패:', error)
      throw error
    }
  }

  return {
    needsConsent,
    isChecking,
    handleConsent,
  }
}
