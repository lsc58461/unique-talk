/**
 * 약관 버전 관리
 * 약관이 변경될 때마다 버전을 업데이트하고 effectiveDate를 수정해야 합니다.
 */

export const TERMS_VERSION = {
  version: '1.0.0',
  effectiveDate: '2026-02-05',
} as const

export const PRIVACY_VERSION = {
  version: '1.0.0',
  effectiveDate: '2026-02-05',
} as const

export type TermsType = 'terms' | 'privacy'
