'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminDashboardChart } from '@/features/admin/components/admin-dashboard-chart'
import { AdminLayout } from '@/features/admin/components/admin-layout'

interface AdminDashboardViewProps {
  stats: {
    totalUsers: number
    totalRooms: number
    totalMessages: number
    recentMessages: number
    todayUsers: number
    yesterdayUsers: number
    activeUsers: number
    avgMessagesPerRoom: number
    yesterdayMessages: number
    totalUsersYesterday: number
    totalRoomsYesterday: number
    totalMessagesYesterday: number
    recentMessagesYesterday: number
    activeUsersYesterday: number
    avgMessagesPerRoomYesterday: number
    dailyStats: any[]
    characterStats: any[]
    characterAffectionStats: any[]
  }
}

export function AdminDashboardView({ stats }: AdminDashboardViewProps) {
  // 전일 대비 계산
  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday > 0) {
      return ((today - yesterday) / yesterday) * 100
    }
    if (today > 0) {
      return 100
    }
    return 0
  }

  // 각 통계별 전일 대비 계산
  const totalUsersTrend = calculateTrend(
    stats.totalUsers,
    stats.totalUsersYesterday,
  )
  const todayUsersTrend = calculateTrend(stats.todayUsers, stats.yesterdayUsers)
  const activeUsersTrend = calculateTrend(
    stats.activeUsers,
    stats.activeUsersYesterday,
  )
  const totalRoomsTrend = calculateTrend(
    stats.totalRooms,
    stats.totalRoomsYesterday,
  )
  const totalMessagesTrend = calculateTrend(
    stats.totalMessages,
    stats.totalMessagesYesterday,
  )
  const recentMessagesTrend = calculateTrend(
    stats.recentMessages,
    stats.recentMessagesYesterday,
  )
  const avgMessagesTrend = calculateTrend(
    stats.avgMessagesPerRoom,
    stats.avgMessagesPerRoomYesterday,
  )

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="size-4 text-green-500" />
    if (change < 0) return <TrendingDown className="size-4 text-red-500" />
    return <Minus className="text-muted-foreground size-4" />
  }

  const getTrendText = (change: number) => {
    if (change === 0) return '어제와 동일'
    const sign = change > 0 ? '+' : ''
    return `어제보다 ${sign}${change.toFixed(1)}%`
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-muted-foreground'
  }

  const statCards = [
    {
      label: '전체 회원 수',
      value: stats.totalUsers,
      unit: '명',
      color: 'blue',
      trend: totalUsersTrend,
    },
    {
      label: '오늘 가입자',
      value: stats.todayUsers,
      unit: '명',
      color: 'green',
      trend: todayUsersTrend,
    },
    {
      label: '활성 사용자 (7일)',
      value: stats.activeUsers,
      unit: '명',
      color: 'purple',
      trend: activeUsersTrend,
    },
    {
      label: '생성된 채팅방',
      value: stats.totalRooms,
      unit: '개',
      color: 'pink',
      trend: totalRoomsTrend,
    },
    {
      label: '전체 메시지 수',
      value: stats.totalMessages,
      unit: '개',
      color: 'orange',
      trend: totalMessagesTrend,
    },
    {
      label: '최근 7일 메시지',
      value: stats.recentMessages,
      unit: '개',
      color: 'cyan',
      trend: recentMessagesTrend,
    },
    {
      label: '채팅방당 평균 메시지',
      value: stats.avgMessagesPerRoom,
      unit: '개',
      color: 'indigo',
      trend: avgMessagesTrend,
    },
  ]

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {card.value.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {card.unit}
                  </span>
                </div>
                {card.trend !== undefined && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {getTrendIcon(card.trend)}
                    <span className={getTrendColor(card.trend)}>
                      {getTrendText(card.trend)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <AdminDashboardChart
          dailyData={stats.dailyStats}
          characterData={stats.characterStats}
          characterAffectionData={stats.characterAffectionStats}
        />
      </div>
    </AdminLayout>
  )
}
