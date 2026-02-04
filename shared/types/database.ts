import { ObjectId } from 'mongodb'

export type CharacterType =
  | 'obsessive'
  | 'tsundere'
  | 'pure'
  | 'makjang'
  | 'younger_powerful'
  | 'younger_cute'
  | 'older_sexy'

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
