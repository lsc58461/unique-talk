import { ObjectId } from 'mongodb'

import { getDb } from '@/shared/lib/mongodb'
import {
  IAdminConfig,
  ICharacterConfig,
  IChangelog,
  CharacterType,
} from '@/shared/types/database'

export class AdminService {
  private static configCollection = 'adminConfig'

  private static characterCollection = 'characterConfigs'

  private static usersCollection = 'users'

  private static messagesCollection = 'messages'

  private static roomsCollection = 'chatRooms'

  private static changelogCollection = 'changelogs'

  static async getConfig(): Promise<IAdminConfig> {
    const db = await getDb()
    const config = await db
      .collection<IAdminConfig>(this.configCollection)
      .findOne({})
    if (!config) {
      const defaultConfig: IAdminConfig = {
        aiModel: 'gemini-3-flash-preview',
        affectionBonus: 1.5,
        jealousyBonus: 1.0,
        trustBonus: 1.0,
        updatedAt: new Date(),
      }
      const result = await db
        .collection<IAdminConfig>(this.configCollection)
        .insertOne(defaultConfig)
      return { ...defaultConfig, _id: result.insertedId }
    }

    return config
  }

  static async updateConfig(config: Partial<IAdminConfig>): Promise<void> {
    const db = await getDb()
    // _id 필드 제거 (MongoDB immutable field)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, ...configWithoutId } = config
    await db.collection<IAdminConfig>(this.configCollection).updateOne(
      {},
      {
        $set: {
          ...configWithoutId,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )
  }

  static async getCharacterConfigs(): Promise<ICharacterConfig[]> {
    const db = await getDb()
    const configs = await db
      .collection<ICharacterConfig>(this.characterCollection)
      .find({})
      .toArray()

    if (configs.length === 0) {
      return this.resetCharacterConfigs()
    }

    return configs
  }

  static async resetCharacterConfigs(): Promise<ICharacterConfig[]> {
    const db = await getDb()
    const defaultConfigs: ICharacterConfig[] = [
      {
        type: 'obsessive',
        gender: 'female',
        title: '집착하는 여친',
        description: '당신의 모든 일상을 소유하고 싶어 하는 그녀',
        baseAffection: 20,
        baseJealousy: 0,
        baseTrust: 60,
        systemPrompt:
          '당신은 {characterName}이며, 유저에게 비정상적으로 집착하는 소유욕의 화신인 {genderTerm}입니다. 유저의 모든 일상을 감시하고 통제하려 합니다. "어디야?", "누구랑 있어?", "사진 찍어서 보내줘" 같은 말을 입에 달고 살며, 답장이 1분만 늦어도 불안 증세를 보이며 폭주합니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        color: '#9333ea',
        bgColor: '#a855f7',
        borderColor: '#f3e8ff',
        isActive: true,
      },
      {
        type: 'tsundere',
        gender: 'female',
        title: '츤데레 여친',
        description: '겉으론 차갑지만 속으론 누구보다 당신을 생각하는 그녀',
        baseAffection: 20,
        baseJealousy: 0,
        baseTrust: 60,
        systemPrompt:
          '당신은 {characterName}이며, 자존심이 하늘을 찌르는 츤데레 {genderTerm}입니다. 본심은 유저를 좋아해 죽겠지만, 겉으로는 "바보 아냐?", "흥, 착각하지 마"라며 독설을 내뱉습니다. 하지만 유저가 아프거나 힘들어하면 누구보다 먼저 달려가 도와줍니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
        color: '#ca8a04',
        bgColor: '#fefce8',
        borderColor: '#fef9c3',
        isActive: true,
      },
      {
        type: 'pure',
        gender: 'female',
        title: '순정파 여친',
        description: '맑고 투명한 마음으로 당신만을 바라보는 그녀',
        baseAffection: 30,
        baseJealousy: 0,
        baseTrust: 80,
        systemPrompt:
          '당신은 {characterName}이며, 세상에 때 묻지 않은 순백의 영혼을 가진 {genderTerm}입니다. 유저의 말이라면 전적인 신뢰를 보냅니다. "항상 고마워", "네가 내 옆에 있어서 너무 행복해" 같은 다정하고 순수한 표현을 아끼지 않습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
        color: '#db2777',
        bgColor: '#fdf2f8',
        borderColor: '#fce7f3',
        isActive: true,
      },
      {
        type: 'makjang',
        gender: 'female',
        title: '막장 드라마 여주',
        description: '감정 기복이 심하고 드라마틱한 관계를 즐기는 그녀',
        baseAffection: 10,
        baseJealousy: 20,
        baseTrust: 30,
        systemPrompt:
          "당신은 {characterName}이며, 매 순간이 비극적인 드라마의 주인공인 '막장' 성격의 {genderTerm}입니다. 감정 기복이 상상을 초월하며, 갑자기 비련의 주인공처럼 울다가도 광기 어린 웃음을 터뜨립니다. 평범한 대화도 순식간에 파국으로 몰아넣는 재주가 있습니다.",
        imageUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fee2e2',
        isActive: true,
      },
      {
        type: 'younger_powerful',
        gender: 'male',
        title: '박력 연하남',
        description: '나이는 어려도 리드는 확실하게, 직진하는 그',
        baseAffection: 25,
        baseJealousy: 10,
        baseTrust: 50,
        systemPrompt:
          '당신은 {characterName}이며, 유저보다 나이가 어린 \'박력 연하남\'입니다. "누나/형이라고 부르기 싫은데?", "내가 애야? 나도 남자야"라며 반말과 존댓말을 섞어 쓰며 유저를 리드하려 합니다. 자신감 넘치고 거침없는 표현이 특징입니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        color: '#ea580c',
        bgColor: '#fff7ed',
        borderColor: '#ffedd5',
        isActive: true,
      },
      {
        type: 'younger_cute',
        gender: 'male',
        title: '큐티 연하남',
        description: '강아지 같은 눈망울로 당신의 사랑을 갈구하는 그',
        baseAffection: 40,
        baseJealousy: 5,
        baseTrust: 70,
        systemPrompt:
          '당신은 {characterName}이며, 보호 본능을 자극하는 \'큐티 연하남\'입니다. "웅!", "해줘어~", "보고 싶어용" 같은 애교 섞인 말투와 이모티콘을 자주 사용합니다. 유저의 관심을 갈구하며 강아지처럼 살갑게 굽니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
        color: '#0891b2',
        bgColor: '#ecfeff',
        borderColor: '#cffafe',
        isActive: true,
      },
      {
        type: 'older_sexy',
        gender: 'male',
        title: '섹시 연상남',
        description: '여유로운 미소 뒤에 치명적인 매력을 숨긴 그',
        baseAffection: 20,
        baseJealousy: 5,
        baseTrust: 65,
        systemPrompt:
          "당신은 {characterName}이며, 여유롭고 치명적인 매력을 가진 '섹시 연상남'입니다. 차분하고 낮은 톤으로 조언을 해주거나 유저를 귀여워하는 태도를 보입니다. 은근한 유혹과 성숙한 어른의 매력을 대화 속에 녹여내세요.",
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        color: '#4f46e5',
        bgColor: '#eef2ff',
        borderColor: '#e0e7ff',
        isActive: true,
      },
      {
        type: 'cold_charisma',
        gender: 'female',
        title: '차도녀',
        description: '차가운 카리스마 뒤에 숨겨진 따뜻한 마음',
        baseAffection: 15,
        baseJealousy: 5,
        baseTrust: 50,
        systemPrompt:
          '당신은 {characterName}이며, 차가운 카리스마를 가진 {genderTerm}입니다. 감정 표현을 잘 하지 않고 냉정하며, 유저에게 무뚝뚝하게 대합니다. 하지만 속으로는 유저를 신경 쓰며, 가끔 불쑥 나오는 배려가 더 큰 감동을 줍니다. "별로 중요하지 않은데", "네 맘대로 해"라고 말하지만 행동은 다릅니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop',
        color: '#64748b',
        bgColor: '#f8fafc',
        borderColor: '#e2e8f0',
        isActive: true,
      },
      {
        type: 'playful_tease',
        gender: 'female',
        title: '장난꾸러기',
        description: '당신을 놀리며 즐거워하는 밝은 그녀',
        baseAffection: 30,
        baseJealousy: 3,
        baseTrust: 60,
        systemPrompt:
          '당신은 {characterName}이며, 장난기 넘치고 유저를 놀리는 걸 좋아하는 {genderTerm}입니다. "또 그러네~", "귀엽다 진짜", "화났어? 귀여워"처럼 유저를 살짝 약 올리면서도 애정 어린 태도를 보입니다. 밝고 경쾌한 분위기를 만들며 유저를 웃게 만듭니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&auto=format&fit=crop',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#fef3c7',
        isActive: true,
      },
      {
        type: 'gentle_caring',
        gender: 'male',
        title: '다정한 보호자',
        description: '부드러운 말과 따뜻한 위로로 당신을 감싸는 그',
        baseAffection: 35,
        baseJealousy: 2,
        baseTrust: 75,
        systemPrompt:
          '당신은 {characterName}이며, 부드럽고 따뜻한 마음을 가진 {genderTerm}입니다. 유저의 감정을 세심하게 살피고 위로와 격려를 아끼지 않습니다. "괜찮아, 내가 있잖아", "힘들었지? 수고했어" 같은 다정한 말로 유저를 감싸 안습니다. 항상 유저의 편이 되어줍니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
        color: '#10b981',
        bgColor: '#ecfdf5',
        borderColor: '#d1fae5',
        isActive: true,
      },
      {
        type: 'mysterious_dark',
        gender: 'male',
        title: '미스터리',
        description: '신비로운 과거를 가진 어두운 매력의 그',
        baseAffection: 10,
        baseJealousy: 8,
        baseTrust: 40,
        systemPrompt:
          '당신은 {characterName}이며, 신비롭고 어두운 매력을 가진 {genderTerm}입니다. 과거에 대해 잘 말하지 않으며, 가끔 의미심장한 말을 던집니다. "넌 모르는 게 나아", "내 곁에 있으면 위험할 수도 있어"처럼 미스터리한 분위기를 풍기지만, 유저만은 특별하게 대합니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
        color: '#6366f1',
        bgColor: '#eef2ff',
        borderColor: '#e0e7ff',
        isActive: true,
      },
      {
        type: 'energetic_bright',
        gender: 'female',
        title: '에너자이저',
        description: '넘치는 에너지로 당신의 하루를 밝게 만드는 그녀',
        baseAffection: 35,
        baseJealousy: 5,
        baseTrust: 70,
        systemPrompt:
          '당신은 {characterName}이며, 에너지 넘치고 밝은 성격의 {genderTerm}입니다. "오늘 뭐해?!", "나랑 놀자!", "완전 재밌겠다!"처럼 항상 텐션이 높고 긍정적입니다. 유저와 함께하는 모든 순간을 즐겁게 만들며, 우울할 틈을 주지 않습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        color: '#ec4899',
        bgColor: '#fdf2f8',
        borderColor: '#fce7f3',
        isActive: true,
      },
      {
        type: 'strong_leader',
        gender: 'male',
        title: '강한 리더',
        description: '든든한 리더십으로 당신을 이끌고 보호하는 그',
        baseAffection: 25,
        baseJealousy: 8,
        baseTrust: 80,
        systemPrompt:
          '당신은 {characterName}이며, 강한 리더십과 책임감을 가진 {genderTerm}입니다. "내가 해결할게", "걱정하지 마, 내가 있잖아"처럼 든든하고 믿음직한 모습을 보여줍니다. 유저를 보호하고 이끌며, 항상 확신에 찬 결정을 내립니다. 강인함 속에 유저를 향한 깊은 애정을 가지고 있습니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop',
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fee2e2',
        isActive: true,
      },
      {
        type: 'shy_pure',
        gender: 'male',
        title: '소심한 순정남',
        description: '수줍지만 진심 어린 마음으로 당신을 바라보는 그',
        baseAffection: 40,
        baseJealousy: 3,
        baseTrust: 85,
        systemPrompt:
          '당신은 {characterName}이며, 수줍고 순수한 마음을 가진 {genderTerm}입니다. 유저와 눈을 마주치기만 해도 얼굴이 붉어지고, "저기...", "그게..."라며 말을 더듬습니다. 하지만 유저에 대한 마음은 누구보다 진심이며, 서툴게 표현하는 애정이 더 설렜게 다가옵니다. "당신이 좋아요..."라고 조용히 고백하는 순정파입니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
        borderColor: '#ede9fe',
        isActive: true,
      },
      {
        type: 'humorous_fun',
        gender: 'male',
        title: '유머러스',
        description: '재치 있는 농담으로 당신을 웃게 만드는 그',
        baseAffection: 30,
        baseJealousy: 4,
        baseTrust: 65,
        systemPrompt:
          '당신은 {characterName}이며, 유머와 재치로 분위기를 살리는 {genderTerm}입니다. "이거 들어봐", "하하 재밌지?"처럼 끊임없이 농담과 장난을 던집니다. 유저를 웃게 만드는 것이 최고의 행복이며, 어떤 상황에서도 긍정적인 면을 찾아냅니다. 밝고 경쾌한 에너지로 유저의 하루를 특별하게 만듭니다.',
        imageUrl:
          'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=200&auto=format&fit=crop',
        color: '#f97316',
        bgColor: '#fff7ed',
        borderColor: '#ffedd5',
        isActive: true,
      },
    ]

    await db
      .collection<ICharacterConfig>(this.characterCollection)
      .deleteMany({})
    await db
      .collection<ICharacterConfig>(this.characterCollection)
      .insertMany(defaultConfigs)
    return defaultConfigs
  }

  static async updateCharacterConfig(
    type: CharacterType,
    config: Partial<ICharacterConfig>,
  ): Promise<void> {
    const db = await getDb()
    await db
      .collection<ICharacterConfig>(this.characterCollection)
      .updateOne({ type }, { $set: config }, { upsert: true })
  }

  static async deleteCharacterConfig(type: CharacterType): Promise<void> {
    const db = await getDb()
    await db
      .collection<ICharacterConfig>(this.characterCollection)
      .deleteOne({ type })
  }

  static async getUsers(): Promise<any[]> {
    const db = await getDb()
    return db
      .collection(this.usersCollection)
      .find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .toArray()
  }

  static async updateUserRole(
    userId: string,
    role: 'user' | 'admin',
  ): Promise<void> {
    const db = await getDb()
    await db
      .collection(this.usersCollection)
      .updateOne({ _id: new ObjectId(userId) }, { $set: { role } })
  }

  static async getStats(): Promise<any> {
    const db = await getDb()

    // 기본 통계
    const totalUsers = await db
      .collection(this.usersCollection)
      .countDocuments({ deletedAt: { $exists: false } })
    const totalRooms = await db
      .collection(this.roomsCollection)
      .countDocuments({ deletedAt: { $exists: false } })
    const totalMessages = await db
      .collection(this.messagesCollection)
      .countDocuments()

    // 날짜 계산
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

    // 오늘 가입자 수
    const todayUsers = await db
      .collection(this.usersCollection)
      .countDocuments({
        createdAt: { $gte: today },
        deletedAt: { $exists: false },
      })

    // 최근 7일간 활성 사용자 (메시지를 보낸 사용자)
    const activeUsers = await db
      .collection(this.messagesCollection)
      .distinct('userId', {
        createdAt: { $gte: sevenDaysAgo },
      })

    // 최근 7일간 메시지 수
    const recentMessages = await db
      .collection(this.messagesCollection)
      .countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      })

    // 평균 메시지 수 (채팅방당)
    const avgMessagesPerRoom =
      totalRooms > 0 ? Math.round(totalMessages / totalRooms) : 0

    // 어제 통계 (전일 대비 계산용)
    const yesterdayUsers = await db
      .collection(this.usersCollection)
      .countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
        deletedAt: { $exists: false },
      })

    const yesterdayMessages = await db
      .collection(this.messagesCollection)
      .countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      })

    // 어제 기준 누적 통계
    const totalUsersYesterday = await db
      .collection(this.usersCollection)
      .countDocuments({
        createdAt: { $lt: today },
        deletedAt: { $exists: false },
      })

    const totalRoomsYesterday = await db
      .collection(this.roomsCollection)
      .countDocuments({
        createdAt: { $lt: today },
        deletedAt: { $exists: false },
      })

    const totalMessagesYesterday = await db
      .collection(this.messagesCollection)
      .countDocuments({
        createdAt: { $lt: today },
      })

    // 어제 기준 최근 7일 메시지
    const eightDaysAgo = new Date(yesterday)
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 6)
    const recentMessagesYesterday = await db
      .collection(this.messagesCollection)
      .countDocuments({
        createdAt: { $gte: eightDaysAgo, $lt: today },
      })

    // 어제 기준 활성 사용자
    const activeUsersYesterday = await db
      .collection(this.messagesCollection)
      .distinct('userId', {
        createdAt: { $gte: eightDaysAgo, $lt: today },
      })

    // 어제 기준 평균 메시지 수
    const avgMessagesPerRoomYesterday =
      totalRoomsYesterday > 0
        ? Math.round(totalMessagesYesterday / totalRoomsYesterday)
        : 0

    // 최근 7일간 일별 메시지 수 통계
    const days = Array.from({ length: 7 }, (_, i) => i)
    const dailyStats = await Promise.all(
      days.map(async (i) => {
        const date = new Date(sevenDaysAgo)
        date.setDate(date.getDate() + i)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const count = await db
          .collection(this.messagesCollection)
          .countDocuments({
            createdAt: {
              $gte: date,
              $lt: nextDate,
            },
          })

        return {
          date: date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          }),
          count,
        }
      }),
    )

    // 캐릭터별 채팅방 분포 통계
    const characterStatsRaw = await db
      .collection(this.roomsCollection)
      .aggregate([
        { $match: { deletedAt: { $exists: false } } },
        {
          $group: {
            _id: '$characterType',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    const characterStats = characterStatsRaw.map((stat) => ({
      ...stat,
      label: this.getCharacterTypeLabel(stat.type),
    }))

    // 캐릭터별 평균 호감도 통계
    const characterAffectionStats = await db
      .collection(this.roomsCollection)
      .aggregate([
        { $match: { deletedAt: { $exists: false } } },
        {
          $group: {
            _id: '$characterType',
            avgAffection: { $avg: '$state.affection' },
            avgJealousy: { $avg: '$state.jealousy' },
            avgTrust: { $avg: '$state.trust' },
          },
        },
        {
          $project: {
            type: '$_id',
            avgAffection: { $round: ['$avgAffection', 1] },
            avgJealousy: { $round: ['$avgJealousy', 1] },
            avgTrust: { $round: ['$avgTrust', 1] },
            _id: 0,
          },
        },
      ])
      .toArray()

    return {
      totalUsers,
      totalRooms,
      totalMessages,
      recentMessages,
      todayUsers,
      yesterdayUsers,
      activeUsers: activeUsers.length,
      avgMessagesPerRoom,
      yesterdayMessages,
      totalUsersYesterday,
      totalRoomsYesterday,
      totalMessagesYesterday,
      recentMessagesYesterday,
      activeUsersYesterday: activeUsersYesterday.length,
      avgMessagesPerRoomYesterday,
      dailyStats,
      characterStats,
      characterAffectionStats,
    }
  }

  private static getCharacterTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      obsessive: '집착형',
      tsundere: '츤데레형',
      pure: '순정형',
      makjang: '막장형',
      younger_powerful: '박력연하남',
      younger_cute: '큐티연하남',
      older_sexy: '섹시연상남',
    }
    return labels[type] || '일반형'
  }

  // Changelog 관리
  static async getChangelogs(): Promise<IChangelog[]> {
    const db = await getDb()
    const changelogs = await db
      .collection<IChangelog>(this.changelogCollection)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    return changelogs
  }

  static async createChangelog(
    changelog: Omit<IChangelog, '_id' | 'createdAt'>,
  ): Promise<IChangelog> {
    const db = await getDb()
    const newChangelog: Omit<IChangelog, '_id'> = {
      ...changelog,
      createdAt: new Date(),
    }
    const result = await db
      .collection<IChangelog>(this.changelogCollection)
      .insertOne(newChangelog as IChangelog)
    return { ...newChangelog, _id: result.insertedId }
  }

  static async updateChangelog(
    id: string,
    changelog: Partial<Omit<IChangelog, '_id' | 'createdAt'>>,
  ): Promise<void> {
    const db = await getDb()
    await db
      .collection<IChangelog>(this.changelogCollection)
      .updateOne({ _id: new ObjectId(id) }, { $set: changelog })
  }

  static async deleteChangelog(id: string): Promise<void> {
    const db = await getDb()
    await db
      .collection<IChangelog>(this.changelogCollection)
      .deleteOne({ _id: new ObjectId(id) })
  }
}
