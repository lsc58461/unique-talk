'use client'

import dayjs from 'dayjs'
import { Sparkles, Wrench, Bug, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { IChangelog } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

const getTypeIcon = (type?: string) => {
  switch (type) {
    case 'feature':
      return <Sparkles className={cn('size-4 text-blue-500')} />
    case 'improvement':
      return <Wrench className={cn('size-4 text-green-500')} />
    case 'bugfix':
      return <Bug className={cn('size-4 text-red-500')} />
    default:
      return null
  }
}

const getTypeBadge = (type?: string) => {
  switch (type) {
    case 'feature':
      return (
        <Badge variant="default" className={cn('bg-blue-500')}>
          신규 기능
        </Badge>
      )
    case 'improvement':
      return (
        <Badge variant="default" className={cn('bg-green-500')}>
          개선
        </Badge>
      )
    case 'bugfix':
      return (
        <Badge variant="default" className={cn('bg-red-500')}>
          버그 수정
        </Badge>
      )
    default:
      return null
  }
}

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
      <CardContent className={cn('pl-0')}>
        {changelogs.length === 0 ? (
          <div className={cn('text-muted-foreground text-center')}>
            아직 등록된 변경 내역이 없습니다.
          </div>
        ) : (
          <div className={cn('relative flex flex-col gap-6')}>
            <div
              className={cn(
                'absolute top-0 bottom-0 left-5 w-0.5 bg-linear-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20',
              )}
            />
            {changelogs.map((changelog, index) => {
              const currentDate = dayjs(changelog.createdAt).format(
                'YYYY-MM-DD',
              )

              return (
                <div
                  // eslint-disable-next-line no-underscore-dangle
                  key={changelog._id?.toString()}
                  className={cn(
                    'relative flex gap-4 pl-12 transition-all duration-300 hover:translate-x-1',
                    'animate-in fade-in slide-in-from-left-8',
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div
                    className={cn(
                      'bg-background ring-border absolute top-1 left-2 flex size-6 items-center justify-center rounded-full shadow-md ring-2',
                    )}
                  >
                    {getTypeIcon(changelog.type)}
                  </div>

                  <div className={cn('flex flex-1 flex-col gap-2')}>
                    <div className={cn('flex flex-wrap items-center gap-2')}>
                      <h3 className={cn('text-base font-semibold')}>
                        {changelog.title}
                      </h3>
                      {getTypeBadge(changelog.type)}
                    </div>

                    <p
                      className={cn(
                        'text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap',
                      )}
                    >
                      {changelog.content}
                    </p>

                    <div
                      className={cn(
                        'text-muted-foreground flex items-center gap-1 text-xs',
                      )}
                    >
                      <Clock className={cn('size-3')} />
                      <span>{currentDate}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
