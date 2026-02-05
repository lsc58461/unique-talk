'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { IChangelog } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

export function ChangelogSection() {
  const [changelogs, setChangelogs] = useState<IChangelog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        const res = await fetch('/api/changelog')
        const data = await res.json()
        setChangelogs(data)
      } catch (err) {
        console.error('Failed to fetch changelogs:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChangelogs()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>변경 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('text-muted-foreground text-center')}>
            로딩 중...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>변경 내역</CardTitle>
        <CardDescription>앱의 최근 업데이트 내역입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {changelogs.length === 0 ? (
          <div className={cn('text-muted-foreground text-center')}>
            아직 등록된 변경 내역이 없습니다.
          </div>
        ) : (
          <div className={cn('flex flex-col gap-4')}>
            {changelogs.map((changelog) => {
              const currentDate = dayjs(changelog.createdAt).format(
                'YYYY-MM-DD',
              )
              const sameDateCount = changelogs.filter(
                (c) => dayjs(c.createdAt).format('YYYY-MM-DD') === currentDate,
              ).length
              const sameDateIndex =
                changelogs
                  .filter(
                    (c) =>
                      dayjs(c.createdAt).format('YYYY-MM-DD') === currentDate,
                  )
                  .findIndex(
                    // eslint-disable-next-line no-underscore-dangle
                    (c) => c._id?.toString() === changelog._id?.toString(),
                  ) + 1

              return (
                <div
                  // eslint-disable-next-line no-underscore-dangle
                  key={changelog._id?.toString()}
                  className={cn(
                    'flex flex-col gap-2 border-b pb-4 last:border-b-0',
                  )}
                >
                  <div className={cn('flex items-center justify-between')}>
                    <h3 className={cn('font-semibold')}>{changelog.title}</h3>
                    <span className={cn('text-muted-foreground text-sm')}>
                      {currentDate}
                      {sameDateCount > 1 &&
                        ` (${sameDateIndex}/${sameDateCount})`}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-muted-foreground text-sm whitespace-pre-wrap',
                    )}
                  >
                    {changelog.content}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
