import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const config = await AdminService.getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to get admin config:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const config = await request.json()
    await AdminService.updateConfig(config)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update admin config:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
