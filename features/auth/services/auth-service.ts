import { ObjectId } from 'mongodb'

import { getDb } from '@/shared/lib/mongodb'

export class AuthService {
  private static usersCollection = 'users'

  private static accountsCollection = 'accounts'

  private static sessionsCollection = 'sessions'

  private static roomsCollection = 'chatRooms'

  private static messagesCollection = 'messages'

  static async withdrawal(userId: string): Promise<boolean> {
    const db = await getDb()
    const userObjectId = new ObjectId(userId)

    try {
      // 1. 유저 정보 조회 (이메일 변경을 위해)
      const user = await db
        .collection(this.usersCollection)
        .findOne({ _id: userObjectId })

      const updateData: any = {
        deletedAt: new Date(),
        updatedAt: new Date(),
      }

      // 2. 이메일이 있다면 중복 방지를 위해 식별자 수정
      if (user?.email) {
        updateData.email = `${user.email}_deleted_${Date.now()}`
      }

      // 3. 소셜 계정 연결 정보 수정 (재가입 허용을 위해)
      await db.collection(this.accountsCollection).updateMany(
        { userId: userObjectId },
        {
          $set: {
            providerAccountId: `deleted_${Date.now()}_${userObjectId.toString()}`,
          },
        },
      )

      // 4. 활성 세션 삭제 (즉시 로그아웃)
      await db.collection(this.sessionsCollection).deleteMany({
        userId: userObjectId,
      })

      // 5. 유저를 소프트 딜리트
      const result = await db.collection(this.usersCollection).updateOne(
        { _id: userObjectId },
        {
          $set: updateData,
        },
      )

      // 2. 관련 데이터(채팅방 등)도 필요에 따라 처리할 수 있지만,
      // 유저가 삭제된 것으로 간주되므로 일단 유저 정보만 마킹합니다.
      // (나중에 로그인 시 deletedAt 체크 필수)

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Withdrawal service error:', error)
      throw error
    }
  }
}
