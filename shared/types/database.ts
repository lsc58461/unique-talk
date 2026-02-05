import { ObjectId } from 'mongodb'

export type CharacterType =
  | 'obsessive'
  | 'tsundere'
  | 'pure'
  | 'makjang'
  | 'younger_powerful'
  | 'younger_cute'
  | 'older_sexy'
  | 'cold_charisma'
  | 'playful_tease'
  | 'gentle_caring'
  | 'mysterious_dark'
  | 'energetic_bright'
  | 'strong_leader'
  | 'shy_pure'
  | 'humorous_fun'

export interface IState {
  affection: number
  jealousy: number
  anger: number
  trust: number
}

export interface IUser {
  id: string // NextAuth id
  name?: string | null
  email?: string | null
  image?: string | null
  role?: 'user' | 'admin'
}

export interface IChatRoom {
  _id?: ObjectId
  userId: string | ObjectId // Support both
  characterType: CharacterType
  gender: 'male' | 'female' // 성별 추가
  name: string // 캐릭터 이름 (사용자가 지정)
  imageUrl: string // 캐릭터 이미지 URL
  color: string // 테마 색상 (Tailwind text class)
  bgColor: string // 테마 배경색 (Tailwind bg class)
  summary: string
  state: IState
  isAdultMode: boolean // 19금 모드 여부
  lastMessage?: string
  updatedAt: Date
  deletedAt?: Date
}

export interface IMessage {
  _id?: ObjectId
  chatRoomId: ObjectId
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  stateDelta?: Partial<IState> // 이전 상태와의 차이값 저장
}

export interface IAdminConfig {
  _id?: ObjectId
  aiModel: string
  affectionBonus: number
  jealousyBonus: number
  trustBonus: number
  updatedAt: Date
}

export interface IChangelog {
  _id?: ObjectId
  title: string
  content: string
  createdAt: Date
}

export interface ICharacterConfig {
  _id?: ObjectId
  type: CharacterType
  gender: 'male' | 'female'
  title: string
  description: string
  baseAffection: number
  baseJealousy: number
  baseTrust: number
  systemPrompt: string
  imageUrl: string
  color: string
  bgColor: string
  borderColor: string
  isActive: boolean
}
