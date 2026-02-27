import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createApiClient } from '@/lib/api'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')!
  const endDate = searchParams.get('endDate')!

  try {
    const api = createApiClient(session.accessToken)
    const user = await api.getMe()
    const groups = await api.getUserGroups(user.id)
    const groupId = groups?.[0]?.id

    if (!groupId) {
      return NextResponse.json({ error: 'Группа не найдена' }, { status: 404 })
    }

    const lessons = await api.getSchedule(user.id, groupId, startDate, endDate)
    return NextResponse.json(lessons)
  } catch (err) {
    console.error('Schedule error:', err)
    return NextResponse.json({ error: 'Ошибка API Дневника.ру' }, { status: 500 })
  }
}
