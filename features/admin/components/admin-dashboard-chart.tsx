'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

interface ChartData {
  date: string
  count: number
}

interface CharacterStat {
  type: string
  count: number
}

interface AdminDashboardChartProps {
  dailyData: ChartData[]
  characterData: CharacterStat[]
  characterAffectionData?: any[]
}

const messageChartConfig = {
  count: {
    label: '메시지 수',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const characterChartConfig = {
  count: {
    label: '채팅방 수',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const affectionChartConfig = {
  avgAffection: {
    label: '호감도',
    color: 'hsl(var(--chart-1))',
  },
  avgJealousy: {
    label: '질투심',
    color: 'hsl(var(--chart-2))',
  },
  avgTrust: {
    label: '신뢰도',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function AdminDashboardChart({
  dailyData,
  characterData,
  characterAffectionData = [],
}: AdminDashboardChartProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>최근 7일간 메시지 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={messageChartConfig}
            className="h-[240px] w-full"
          >
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--chart-1))"
                fill="url(#fillCount)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>캐릭터별 채팅방 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={characterChartConfig}
            className="h-[300px] w-full"
          >
            <BarChart data={characterData} layout="horizontal">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {characterAffectionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>캐릭터별 평균 감정 지수</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={affectionChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={characterAffectionData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="avgAffection"
                  fill="var(--color-avgAffection)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="avgJealousy"
                  fill="var(--color-avgJealousy)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="avgTrust"
                  fill="var(--color-avgTrust)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
