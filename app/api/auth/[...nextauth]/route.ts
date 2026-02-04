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
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const newSession = { ...session }
      if (newSession.user) {
        // @ts-ignore
        newSession.user.id = user.id
      }
      return newSession
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
