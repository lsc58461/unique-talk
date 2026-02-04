import { GoogleGenAI, Type } from '@google/genai'

import { IMessage, IState } from '@/shared/types/database'

import { AiEmotionService } from './ai-emotion-service'

// Google Gemini API Key (환경 변수에서 가져옴)
const apiKey = process.env.GOOGLE_AI_API_KEY || ''
if (!apiKey) {
  console.error('GOOGLE_AI_API_KEY is missing in .env file')
}

const client = new GoogleGenAI({ apiKey })

// 응답 JSON 스키마 정의
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    content: {
      type: Type.STRING,
      description: '캐릭터의 대화 내용 (마크다운 지원)',
    },
    stateDelta: {
      type: Type.OBJECT,
      properties: {
        affection: {
          type: Type.NUMBER,
          description: '호감도 변화량 (-10 ~ 15)',
        },
        jealousy: {
          type: Type.NUMBER,
          description: '질투심 변화량 (-10 ~ 10)',
        },
        anger: { type: Type.NUMBER, description: '분노 변화량 (-10 ~ 10)' },
        trust: { type: Type.NUMBER, description: '신뢰도 변화량 (-10 ~ 10)' },
      },
      required: ['affection', 'jealousy', 'anger', 'trust'],
    },
  },
  required: ['content', 'stateDelta'],
}

export class AiService {
  /**
   * 유저 메시지에 대한 AI 응답을 생성합니다.
   */
  static async generateResponse(
    characterType: string,
    history: IMessage[],
    currentState: IState,
    summary: string,
    characterName: string,
    gender: 'male' | 'female',
  ): Promise<{
    content: string
    stateDelta: Partial<IState>
    summaryUpdate: string
  }> {
    // 1. 시스템 프롬프트 생성 (페르소나 + 현재 감정 반영)
    const systemPrompt = AiEmotionService.getSystemPrompt(
      characterType,
      currentState,
      summary,
      characterName,
      gender,
    )

    try {
      // 히스토리에서 마지막 메시지(현재 유저 메시지) 추출
      const userMessage = history[history.length - 1]
      const chatHistory = history.slice(0, -1)

      // 2. Gemini API 호출
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: userMessage.content }] },
        ],
        config: {
          systemInstruction: {
            role: 'system',
            parts: [
              {
                text: `당신은 유저와 대화하는 캐릭터입니다. 아래의 페르소나와 현재 상황에 맞춰 응답하세요.
답변은 반드시 JSON 형식이어야 하며, content(대화 내용)와 stateDelta(감정 변화량)를 포함해야 합니다.

${systemPrompt}`,
              },
            ],
          },
          responseMimeType: 'application/json',
          responseSchema,
          maxOutputTokens: 1000,
          temperature: 0.9,
        },
      })

      // JSON 응답 파싱
      const rawContent = response.text || ''
      let parsedData: { content: string; stateDelta: IState }
      try {
        parsedData = JSON.parse(rawContent)
      } catch (error) {
        console.error('Failed to parse AI response as JSON:', rawContent, error)
        throw new Error('Invalid AI response format')
      }

      const content = parsedData.content || ''
      const stateDelta = parsedData.stateDelta || {
        affection: 1,
        jealousy: 0,
        anger: 0,
        trust: 0,
      }

      const summaryUpdate = `${summary} ${content.slice(0, 30)}...`.slice(-200)

      return {
        content,
        stateDelta,
        summaryUpdate,
      }
    } catch (error: any) {
      console.error('Gemini API Error Detail:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
      })
      return {
        content: '미안해, 지금 잠시 머리가 아파서... 나중에 다시 얘기하자. 😢',
        stateDelta: {},
        summaryUpdate: summary,
      }
    }
  }
}
