'use client'

import dayjs from 'dayjs'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminLayout } from '@/features/admin/components/admin-layout'

export function AdminUsersView() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast.error('회원 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (
    userId: string,
    newRole: 'user' | 'admin',
  ) => {
    setIsUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (res.ok) {
        toast.success('권한이 변경되었습니다.')
        fetchUsers()
      } else {
        toast.error('권한 변경에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to update role:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-muted-foreground p-20 text-center">로딩 중...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>전체 회원 목록</CardTitle>
            <CardDescription>
              총 {users.length}명의 회원이 등록되어 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>권한</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  // eslint-disable-next-line no-underscore-dangle
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image && (
                          <Image
                            src={user.image}
                            alt={user.name || '사용자'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        )}
                        <span className="font-medium">
                          {user.name || '이름 없음'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === 'admin' ? 'default' : 'secondary'
                        }
                      >
                        {user.role === 'admin' ? '관리자' : '일반'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRole =
                            user.role === 'admin' ? 'user' : 'admin'
                          // eslint-disable-next-line no-underscore-dangle
                          handleRoleChange(user._id, newRole)
                        }}
                        disabled={
                          // eslint-disable-next-line no-underscore-dangle
                          isUpdating === user._id ||
                          // eslint-disable-next-line no-underscore-dangle
                          session?.user?.id === user._id
                        }
                      >
                        {/* eslint-disable-next-line no-underscore-dangle */}
                        {isUpdating === user._id && '변경 중...'}
                        {/* eslint-disable-next-line no-underscore-dangle */}
                        {isUpdating !== user._id &&
                          user.role === 'admin' &&
                          '일반으로 변경'}
                        {/* eslint-disable-next-line no-underscore-dangle */}
                        {isUpdating !== user._id &&
                          user.role !== 'admin' &&
                          '관리자로 변경'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
