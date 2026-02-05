import type {
  ITermsConsent,
  ITermsConsentCheckResponse,
  ITermsConsentRequest,
} from '@/types/terms'

/**
 * 사용자의 약관 동의 여부 확인
 */
export const checkTermsConsent =
  async (): Promise<ITermsConsentCheckResponse> => {
    const response = await fetch('/api/terms/check')

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('약관 동의 확인 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      throw new Error(
        `약관 동의 확인 실패 (${response.status}): ${errorData.error || response.statusText}`,
      )
    }

    return response.json()
  }

/**
 * 약관 동의 저장
 */
export const saveTermsConsent = async (
  data: ITermsConsentRequest,
): Promise<ITermsConsent> => {
  const response = await fetch('/api/terms/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('약관 동의 저장 실패')
  }

  return response.json()
}

/**
 * 사용자의 약관 동의 내역 조회
 */
export const getTermsConsent = async (): Promise<ITermsConsent | null> => {
  const response = await fetch('/api/terms/consent')

  if (!response.ok) {
    throw new Error('약관 동의 내역 조회 실패')
  }

  return response.json()
}
