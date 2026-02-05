import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from '@/shared/constants/terms-version'
import { getDb } from '@/shared/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const db = await getDb()
    const termsConsent = await db
      .collection('termsConsents')
      .findOne({ userId: session.user.id })

    const needsConsent =
      !termsConsent ||
      termsConsent.termsVersion !== TERMS_VERSION.version ||
      termsConsent.privacyVersion !== PRIVACY_VERSION.version

    return NextResponse.json({
      needsConsent,
      currentTermsVersion: TERMS_VERSION.version,
      currentPrivacyVersion: PRIVACY_VERSION.version,
      userTermsVersion: termsConsent?.termsVersion,
      userPrivacyVersion: termsConsent?.privacyVersion,
    })
  } catch (error) {
    console.error('약관 동의 확인 오류:', error)
    return NextResponse.json(
      { error: '약관 동의 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
