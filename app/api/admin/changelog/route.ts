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

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 },
      )
    }
    const changelog = await AdminService.createChangelog({ title, content })
    return NextResponse.json(changelog)
  } catch (error) {
    console.error('Failed to create changelog:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Changelog ID is required' },
        { status: 400 },
      )
    }

    await AdminService.deleteChangelog(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete changelog:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
