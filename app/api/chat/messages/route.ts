/* eslint-disable no-underscore-dangle */
import { NextResponse } from 'next/server'

import { AiEmotionService } from '@/features/ai/services/ai-emotion-service'
import { AiService } from '@/features/ai/services/ai-service'
import { ChatService } from '@/features/chat/services/chat-service'

// GET /api/chat/messages?chatRoomId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get('chatRoomId')

    if (!chatRoomId) {
      return NextResponse.json(
        { error: 'Chat Room ID is required' },
        { status: 400 },
      )
    }

    const messages = await ChatService.getMessages(chatRoomId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to get messages:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// POST /api/chat/messages
export async function POST(request: Request) {
  try {
    const { chatRoomId, content, chatRoom } = await request.json()

    if (!chatRoomId || !content || !chatRoom) {
      return NextResponse.json(
        { error: 'Chat Room ID, Content, and Chat Room data are required' },
        { status: 400 },
      )
    }

    // 1. Save user message
    const userMessage = await ChatService.addMessage(
      chatRoomId,
      'user',
      content,
    )

    // 2. Prepare AI Context
    // 대화 내역을 가져올 때 현재 추가된 메시지도 포함됩니다.
    const recentMessages = await ChatService.getMessages(chatRoomId, 11)
    const history = recentMessages
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      .reverse()

    if (history.length === 0) {
      throw new Error('Failed to retrieve message history')
    }

    // 3. Call AI Service
    console.info('Calling AI Service with:', {
      characterType: chatRoom.characterType,
      historyCount: history.length,
      lastMessage: history[history.length - 1].content,
    })

    const aiResponse = await AiService.generateResponse(
      chatRoom.characterType,
      history as any,
      chatRoom.state,
      chatRoom.summary,
      chatRoom.name,
      chatRoom.gender,
    )

    // 4. Update State and Summary
    const newState = AiEmotionService.updateState(
      chatRoom.state,
      aiResponse.stateDelta,
    )
    const newSummary = aiResponse.summaryUpdate || chatRoom.summary

    // 5. Update user message with state delta (기록용)
    if (userMessage._id) {
      await ChatService.updateMessageDelta(
        userMessage._id.toString(),
        aiResponse.stateDelta,
      )
    }

    // 6. Save AI response with state delta
    const aiMessage = await ChatService.addMessage(
      chatRoomId,
      'assistant',
      aiResponse.content,
      aiResponse.stateDelta,
    )

    // 7. Update room state and summary in DB
    await ChatService.updateRoomStateAndSummary(
      chatRoomId,
      newState,
      newSummary,
    )

    return NextResponse.json({
      message: aiMessage,
      state: newState,
      userMessageDelta: aiResponse.stateDelta, // 클라이언트에서 유저 메시지 하단에 표시하기 위해 반환
    })
  } catch (error) {
    console.error('Failed to process message:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
