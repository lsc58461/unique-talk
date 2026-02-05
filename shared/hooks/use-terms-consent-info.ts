'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { getTermsConsent } from '@/services/terms.service'
import type { ITermsConsent } from '@/types/terms'

export function useTermsConsentInfo() {
  const { data: session, status } = useSession()
  const [consentInfo, setConsentInfo] = useState<ITermsConsent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConsentInfo = async () => {
      if (status !== 'authenticated' || !session?.user) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getTermsConsent()
        setConsentInfo(data)
      } catch (error) {
        console.error('약관 동의 정보 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConsentInfo()
  }, [session, status])

  return { consentInfo, isLoading }
}
