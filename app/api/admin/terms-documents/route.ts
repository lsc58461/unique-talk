import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDb } from '@/shared/lib/mongodb'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || (type !== 'terms' && type !== 'privacy')) {
      return NextResponse.json(
        { error: '유효하지 않은 약관 타입입니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const document = await db
      .collection('termsDocuments')
      .findOne({ type }, { sort: { createdAt: -1 } })

    return NextResponse.json(document)
  } catch (error) {
    console.error('약관 문서 조회 오류:', error)
    return NextResponse.json(
      { error: '약관 문서 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { type, version, effectiveDate, content } = body

    if (!type || !version || !effectiveDate || !content) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const now = new Date().toISOString()

    const document = {
      type,
      version,
      effectiveDate,
      content,
      createdAt: now,
      updatedAt: now,
      createdBy: session.user.id,
    }

    const result = await db.collection('termsDocuments').insertOne(document)

    return NextResponse.json({ ...document, _id: result.insertedId })
  } catch (error) {
    console.error('약관 문서 저장 오류:', error)
    return NextResponse.json(
      { error: '약관 문서 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
