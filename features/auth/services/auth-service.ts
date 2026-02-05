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
      // 1. 유저 정보 조회
      const user = await db
        .collection(this.usersCollection)
        .findOne({ _id: userObjectId })

      if (!user) return false

      const deletedSuffix = `_deleted_${Date.now()}`
      const updateData: any = {
        name: `${user.name || 'User'}${deletedSuffix}`,
        deletedAt: new Date(),
        updatedAt: new Date(),
      }

      // 이메일이 있다면 중복 방지를 위해 수정
      if (user.email) {
        updateData.email = `${user.email}${deletedSuffix}`
      }

      // 2. 연동된 계정 정보(OAuth) 삭제 (하드 딜리트)
      // 이를 삭제해야 나중에 같은 소셜 계정으로 재가입이 가능합니다.
      await db.collection(this.accountsCollection).deleteMany({
        userId: userObjectId,
      })

      // 3. 활성 세션 삭제
      await db.collection(this.sessionsCollection).deleteMany({
        userId: userObjectId,
      })

      // 4. 유저 정보 소프트 딜리트 (식별 정보 변조)
      const result = await db.collection(this.usersCollection).updateOne(
        { _id: userObjectId },
        {
          $set: updateData,
        },
      )

      // 5. 관련 데이터 소프트 딜리트 (채팅방)
      await db
        .collection(this.roomsCollection)
        .updateMany(
          { userId: userObjectId },
          { $set: { deletedAt: new Date() } },
        )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Withdrawal service error:', error)
      throw error
    }
  }
}
