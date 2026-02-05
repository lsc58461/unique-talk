import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const changelogs = await AdminService.getChangelogs()
    return NextResponse.json(changelogs)
  } catch (error) {
    console.error('Failed to get changelogs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
