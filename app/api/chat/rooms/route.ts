import { NextResponse } from 'next/server'

import { ChatService } from '@/features/chat/services/chat-service'

// GET /api/chat/rooms?userId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const rooms = await ChatService.getRoomsByUser(userId)
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Failed to get chat rooms:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// POST /api/chat/rooms
export async function POST(request: Request) {
  try {
    const { userId, characterType, gender, name, imageUrl, color, bgColor } =
      await request.json()

    if (
      !userId ||
      !characterType ||
      !gender ||
      !name ||
      !imageUrl ||
      !color ||
      !bgColor
    ) {
      return NextResponse.json(
        {
          error:
            'User ID, Character Type, Gender, Name, ImageUrl, Color, and BgColor are required',
        },
        { status: 400 },
      )
    }

    const room = await ChatService.createRoom(
      userId,
      characterType,
      gender,
      name,
      imageUrl,
      color,
      bgColor,
    )
    return NextResponse.json(room)
  } catch (error) {
    console.error('Failed to create chat room:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// DELETE /api/chat/rooms?roomId=...&userId=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'Room ID and User ID are required' },
        { status: 400 },
      )
    }

    const success = await ChatService.deleteRoom(roomId, userId)

    if (success) {
      return NextResponse.json({ message: 'Chat room deleted successfully' })
    }

    return NextResponse.json(
      { error: 'Failed to delete chat room or room not found' },
      { status: 404 },
    )
  } catch (error) {
    console.error('Failed to delete chat room:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
