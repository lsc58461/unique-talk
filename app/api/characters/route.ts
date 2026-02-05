import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const configs = await AdminService.getCharacterConfigs()
    const activeConfigs = configs.filter((c) => c.isActive)
    return NextResponse.json(activeConfigs)
  } catch (error) {
    console.error('Failed to get characters:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
