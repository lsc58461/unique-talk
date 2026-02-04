import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AuthService } from '@/features/auth/services/auth-service'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await AuthService.withdrawal(session.user.id)

    if (success) {
      return NextResponse.json({ message: 'Withdrawal successful' })
    }

    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 },
    )
  } catch (error) {
    console.error('Withdrawal API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
