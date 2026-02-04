import { ObjectId } from 'mongodb'

import { getDb } from '@/shared/lib/mongodb'
import {
  IChatRoom,
  IMessage,
  CharacterType,
  IState,
} from '@/shared/types/database'

export class ChatService {
  private static roomsCollection = 'chatRooms'

  private static messagesCollection = 'messages'

  private static INITIAL_STATE: IState = {
    affection: 0,
    jealousy: 0,
    anger: 0,
    trust: 50,
  }

  static async getRoomsByUser(userId: string): Promise<IChatRoom[]> {
    const db = await getDb()
    return db
      .collection<IChatRoom>(this.roomsCollection)
      .find({
        userId: new ObjectId(userId),
        deletedAt: { $exists: false },
      })
      .sort({ updatedAt: -1 })
      .toArray()
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
    const newRoom: IChatRoom = {
      userId: new ObjectId(userId),
      characterType,
      gender,
      name,
      imageUrl,
      color,
      bgColor,
      summary: '',
      state: { ...this.INITIAL_STATE },
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
    return db
      .collection<IMessage>(this.messagesCollection)
      .find({ chatRoomId: new ObjectId(chatRoomId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  }

  static async addMessage(
    chatRoomId: string,
    role: 'user' | 'assistant',
    content: string,
    stateDelta?: Partial<IState>,
  ): Promise<IMessage> {
    const db = await getDb()
    const newMessage: IMessage = {
      chatRoomId: new ObjectId(chatRoomId),
      role,
      content,
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
          lastMessage: content,
          updatedAt: new Date(),
        },
      },
    )

    return { ...newMessage, _id: result.insertedId }
  }

  static async updateRoomStateAndSummary(
    chatRoomId: string,
    state: IState,
    summary: string,
  ): Promise<void> {
    const db = await getDb()
    await db.collection<IChatRoom>(this.roomsCollection).updateOne(
      { _id: new ObjectId(chatRoomId) },
      {
        $set: {
          state,
          summary,
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
