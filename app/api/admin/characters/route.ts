import { NextResponse } from 'next/server'

import { AdminService } from '@/features/admin/services/admin-service'

export async function GET() {
  try {
    const configs = await AdminService.getCharacterConfigs()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Failed to get character configs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { type, ...config } = await request.json()
    if (!type) {
      return NextResponse.json(
        { error: 'Character type is required' },
        { status: 400 },
      )
    }
    await AdminService.updateCharacterConfig(type, config)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update character config:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function PUT() {
  try {
    const configs = await AdminService.resetCharacterConfigs()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Failed to reset character configs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: 'Character type is required' },
        { status: 400 },
      )
    }

    await AdminService.deleteCharacterConfig(type as any)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete character config:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
