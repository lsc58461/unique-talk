import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

import { getDb } from '@/shared/lib/mongodb'

export async function PATCH(req: NextRequest) {
  try {
    const { roomId, isAdultMode } = await req.json()

    if (!roomId || typeof isAdultMode !== 'boolean') {
      return NextResponse.json(
        { error: 'roomId와 isAdultMode가 필요합니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const roomsCollection = db.collection('chatRooms')

    const result = await roomsCollection.updateOne(
      { _id: new ObjectId(roomId) },
      { $set: { isAdultMode, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '채팅방을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle adult mode error:', error)
    return NextResponse.json(
      { error: '모드 전환 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
