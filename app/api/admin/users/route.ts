import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const users = await AdminService.getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to get admin users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and Role are required' },
        { status: 400 },
      )
    }
    await AdminService.updateUserRole(userId, role)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update user role:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
