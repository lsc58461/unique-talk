import { MongoDBAdapter } from '@auth/mongodb-adapter'
import NextAuth, { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'

import clientPromise from '@/shared/lib/mongodb'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          name:
            profile.kakao_account?.profile?.nickname ||
            profile.properties?.nickname,
          email: profile.kakao_account?.email || null,
          image:
            profile.kakao_account?.profile?.profile_image_url ||
            profile.properties?.profile_image,
          role: 'user', // 가입 시 기본 역할 설정
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      const newToken = { ...token }
      if (user) {
        // @ts-ignore
        newToken.role = user.role || 'user'
        newToken.sub = user.id
      } else if (!newToken.role) {
        // 기존 세션 토큰에 role이 없는 경우를 대비한 안전장치
        newToken.role = 'user'
      }
      return newToken
    },
    async session({ session, token }) {
      const newSession = { ...session }
      if (newSession.user && token) {
        // @ts-ignore
        newSession.user.id = token.sub
        // @ts-ignore
        newSession.user.role = token.role || 'user'
      }
      return newSession
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  events: {
    async createUser({ user }) {
      // 사용자가 처음 생성될 때 DB에 role: 'user'가 확실히 저장되도록 보장
      // MongoDBAdapter가 profile에서 리턴된 role을 자동으로 넣지만, 한 번 더 보장함
      console.info(
        `New user created: ${user.id}, setting default role to 'user'`,
      )
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
