export interface ITermsConsent {
  userId: string
  termsVersion: string
  privacyVersion: string
  termsConsentedAt: string
  privacyConsentedAt: string
  createdAt: string
  updatedAt: string
}

export interface ITermsConsentRequest {
  termsVersion: string
  privacyVersion: string
}

export interface ITermsConsentCheckResponse {
  needsConsent: boolean
  currentTermsVersion: string
  currentPrivacyVersion: string
  userTermsVersion?: string
  userPrivacyVersion?: string
}
