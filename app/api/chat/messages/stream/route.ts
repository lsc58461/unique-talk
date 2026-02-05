/* eslint-disable no-underscore-dangle */
import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'
import { AiEmotionService } from '@/features/ai/services/ai-emotion-service'
import { AiService } from '@/features/ai/services/ai-service'
import { ChatService } from '@/features/chat/services/chat-service'

export async function POST(request: Request) {
  try {
    const { chatRoomId, content, chatRoom } = await request.json()

    if (!chatRoomId || !content || !chatRoom) {
      return NextResponse.json(
        { error: 'Chat Room ID, Content, and Chat Room data are required' },
        { status: 400 },
      )
    }

    // 1. 사용자 메시지 저장
    const userMessage = await ChatService.addMessage(
      chatRoomId,
      'user',
      content,
    )

    // 2. 대화 내역 준비
    const recentMessages = await ChatService.getMessages(chatRoomId, 11)
    const history = recentMessages
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      .reverse()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let finalData: any = null

          /* eslint-disable no-restricted-syntax */
          // AiService에서 스트리밍 생성기 호출
          for await (const part of AiService.generateResponseStream(
            chatRoom.characterType,
            history as any,
            chatRoom.state,
            chatRoom.summary,
            chatRoom.name,
            chatRoom.gender,
            chatRoom.isAdultMode || false,
          )) {
            if (part.type === 'content') {
              // 텍스트 조각 전송 (SSE 포맷: data: <content>\n\n)
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: part.value })}\n\n`,
                ),
              )
            } else if (part.type === 'data') {
              finalData = part.value
            }
          }

          if (finalData) {
            // 관리자 설정 가져오기 (감정 보너스 등)
            const adminConfig = await AdminService.getConfig()

            // 최종 데이터 처리 (DB 업데이트 등)
            const newState = AiEmotionService.updateState(
              chatRoom.state,
              finalData.stateDelta,
              {
                affectionBonus: adminConfig.affectionBonus,
                jealousyBonus: adminConfig.jealousyBonus,
                trustBonus: adminConfig.trustBonus,
              },
            )
            const newSummary = finalData.summaryUpdate || chatRoom.summary

            if (userMessage._id) {
              await ChatService.updateMessageDelta(
                userMessage._id.toString(),
                finalData.stateDelta,
              )
            }

            const aiMessage = await ChatService.addMessage(
              chatRoomId,
              'assistant',
              finalData.content,
              finalData.stateDelta,
            )

            await ChatService.updateRoomStateAndSummary(
              chatRoomId,
              newState,
              newSummary,
            )

            // 최종 데이터 전송
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  message: aiMessage,
                  state: newState,
                  userMessageDelta: finalData.stateDelta,
                })}\n\n`,
              ),
            )
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Failed to process message:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
