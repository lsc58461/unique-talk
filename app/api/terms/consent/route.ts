import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

    return NextResponse.json(termsConsent)
  } catch (error) {
    console.error('약관 동의 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '약관 동의 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { termsVersion, privacyVersion } = body

    if (!termsVersion || !privacyVersion) {
      return NextResponse.json(
        { error: '약관 버전 정보가 필요합니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const now = new Date().toISOString()

    const termsConsent = {
      userId: session.user.id,
      termsVersion,
      privacyVersion,
      termsConsentedAt: now,
      privacyConsentedAt: now,
      createdAt: now,
      updatedAt: now,
    }

    await db
      .collection('termsConsents')
      .updateOne(
        { userId: session.user.id },
        { $set: termsConsent },
        { upsert: true },
      )

    return NextResponse.json(termsConsent)
  } catch (error) {
    console.error('약관 동의 저장 오류:', error)
    return NextResponse.json(
      { error: '약관 동의 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
