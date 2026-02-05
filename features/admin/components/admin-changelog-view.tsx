'use client'

import dayjs from 'dayjs'
import { Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { AdminLayout } from '@/features/admin/components/admin-layout'
import type { IChangelog } from '@/shared/types/database'

export function AdminChangelogView() {
  const [changelogs, setChangelogs] = useState<IChangelog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchChangelogs = async () => {
    try {
      const res = await fetch('/api/admin/changelog')
      const data = await res.json()
      setChangelogs(data)
    } catch (err) {
      console.error('Failed to fetch changelogs:', err)
      toast.error('변경 내역을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChangelogs()
  }, [])

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        toast.success('변경 내역이 등록되었습니다.')
        setTitle('')
        setContent('')
        fetchChangelogs()
      } else {
        toast.error('등록에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to create changelog:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/changelog?id=${deleteTarget}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('삭제되었습니다.')
        fetchChangelogs()
      } else {
        toast.error('삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to delete changelog:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteTarget(null)
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
        <div>
          <h2 className="text-2xl font-bold">변경 내역 관리</h2>
          <p className="text-muted-foreground text-sm">
            앱의 변경 내역을 등록하고 관리합니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 변경 내역 등록</CardTitle>
            <CardDescription>
              사용자에게 표시될 변경 내역을 작성합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="예: 새로운 캐릭터 추가"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="변경 내역을 상세히 작성해주세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="self-end"
              >
                <Plus className="mr-2 size-4" />
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>변경 내역 목록</CardTitle>
            <CardDescription>
              총 {changelogs.length}개의 변경 내역이 등록되어 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelogs.map((changelog) => (
                  // eslint-disable-next-line no-underscore-dangle
                  <TableRow key={changelog._id?.toString()}>
                    <TableCell className="text-muted-foreground">
                      {dayjs(changelog.createdAt).format('YYYY-MM-DD')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {changelog.title}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {changelog.content}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          // eslint-disable-next-line no-underscore-dangle
                          handleDeleteClick(changelog._id?.toString() || '')
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>변경 내역 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 변경 내역을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
