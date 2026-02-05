import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

import { getDb } from '@/shared/lib/mongodb'

export async function PATCH(req: NextRequest) {
  try {
    const { chatRoomId, isNSFW } = await req.json()

    if (!chatRoomId || typeof isNSFW !== 'boolean') {
      return NextResponse.json(
        { error: 'chatRoomId와 isNSFW가 필요합니다.' },
        { status: 400 },
      )
    }

    const db = await getDb()
    const roomsCollection = db.collection('chatRooms')

    const result = await roomsCollection.updateOne(
      { _id: new ObjectId(chatRoomId) },
      { $set: { isNSFW, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '채팅방을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle NSFW mode error:', error)
    return NextResponse.json(
      { error: '모드 전환 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
