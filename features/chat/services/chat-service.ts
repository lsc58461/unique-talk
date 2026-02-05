import { ObjectId } from 'mongodb'

import { getDb } from '@/shared/lib/mongodb'
import {
  IChatRoom,
  IMessage,
  CharacterType,
  IState,
  ICharacterConfig,
} from '@/shared/types/database'
import { CryptoUtil } from '@/shared/utils/crypto-util'

export class ChatService {
  private static roomsCollection = 'chatRooms'

  private static messagesCollection = 'messages'

  private static INITIAL_STATE: IState = {
    affection: 20,
    jealousy: 0,
    anger: 0,
    trust: 60,
  }

  static async getRoomsByUser(userId: string): Promise<IChatRoom[]> {
    const db = await getDb()
    const rooms = await db
      .collection<IChatRoom>(this.roomsCollection)
      .find({
        userId: new ObjectId(userId),
        deletedAt: { $exists: false },
      })
      .sort({ updatedAt: -1 })
      .toArray()

    return rooms.map((room) => ({
      ...room,
      lastMessage: room.lastMessage
        ? CryptoUtil.decrypt(room.lastMessage)
        : room.lastMessage,
      summary: room.summary ? CryptoUtil.decrypt(room.summary) : room.summary,
    }))
  }

  static async createRoom(
    userId: string,
    characterType: CharacterType,
    gender: 'male' | 'female',
    name: string,
    imageUrl: string,
    color: string,
    bgColor: string,
  ): Promise<IChatRoom> {
    const db = await getDb()

    // 관리자 설정에서 해당 캐릭터의 초기 스탯 가져오기
    const charConfig = await db
      .collection<ICharacterConfig>('characterConfigs')
      .findOne({ type: characterType })

    const initialState: IState = charConfig
      ? {
          affection: charConfig.baseAffection,
          jealousy: charConfig.baseJealousy,
          anger: 0,
          trust: charConfig.baseTrust,
        }
      : { ...this.INITIAL_STATE }

    const newRoom: IChatRoom = {
      userId: new ObjectId(userId),
      characterType,
      gender,
      name,
      imageUrl,
      color,
      bgColor,
      summary: '',
      state: initialState,
      updatedAt: new Date(),
    }

    const result = await db
      .collection<IChatRoom>(this.roomsCollection)
      .insertOne(newRoom)
    return { ...newRoom, _id: result.insertedId }
  }

  static async getMessages(
    chatRoomId: string,
    limit = 20,
  ): Promise<IMessage[]> {
    const db = await getDb()
    const messages = await db
      .collection<IMessage>(this.messagesCollection)
      .find({ chatRoomId: new ObjectId(chatRoomId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return messages.map((msg) => ({
      ...msg,
      content: CryptoUtil.decrypt(msg.content),
    }))
  }

  static async addMessage(
    chatRoomId: string,
    role: 'user' | 'assistant',
    content: string,
    stateDelta?: Partial<IState>,
  ): Promise<IMessage> {
    const db = await getDb()
    const encryptedContent = CryptoUtil.encrypt(content)
    const newMessage: IMessage = {
      chatRoomId: new ObjectId(chatRoomId),
      role,
      content: encryptedContent,
      createdAt: new Date(),
      stateDelta,
    }

    const result = await db
      .collection<IMessage>(this.messagesCollection)
      .insertOne(newMessage)

    // Update last message in room
    await db.collection<IChatRoom>(this.roomsCollection).updateOne(
      { _id: new ObjectId(chatRoomId) },
      {
        $set: {
          lastMessage: encryptedContent,
          updatedAt: new Date(),
        },
      },
    )

    return { ...newMessage, _id: result.insertedId, content }
  }

  static async updateRoomStateAndSummary(
    chatRoomId: string,
    state: IState,
    summary: string,
  ): Promise<void> {
    const db = await getDb()
    const encryptedSummary = CryptoUtil.encrypt(summary)
    await db.collection<IChatRoom>(this.roomsCollection).updateOne(
      { _id: new ObjectId(chatRoomId) },
      {
        $set: {
          state,
          summary: encryptedSummary,
          updatedAt: new Date(),
        },
      },
    )
  }

  static async deleteRoom(
    chatRoomId: string,
    userId: string,
  ): Promise<boolean> {
    const db = await getDb()
    const result = await db
      .collection<IChatRoom>(this.roomsCollection)
      .updateOne(
        {
          _id: new ObjectId(chatRoomId),
          userId: new ObjectId(userId),
        },
        {
          $set: { deletedAt: new Date() },
        },
      )

    return result.modifiedCount > 0
  }

  static async updateMessageDelta(
    messageId: string,
    stateDelta: Partial<IState>,
  ): Promise<boolean> {
    const db = await getDb()
    const result = await db
      .collection<IMessage>(this.messagesCollection)
      .updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: { stateDelta },
        },
      )
    return result.modifiedCount > 0
  }
}
