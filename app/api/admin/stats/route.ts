import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const stats = await AdminService.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to get admin stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
