import { NextResponse } from 'next/server'

import { getDb } from '@/shared/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params

    if (type !== 'terms' && type !== 'privacy') {
      return NextResponse.json(
        { error: '유효하지 않은 약관 타입입니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const document = await db
      .collection('termsDocuments')
      .findOne({ type }, { sort: { createdAt: -1 } })

    if (!document) {
      return NextResponse.json(
        { error: '약관 문서를 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('약관 문서 조회 오류:', error)
    return NextResponse.json(
      { error: '약관 문서 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
