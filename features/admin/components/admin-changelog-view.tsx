'use client'

import dayjs from 'dayjs'
import { Plus, Trash2, Pencil } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [type, setType] = useState<'feature' | 'improvement' | 'bugfix'>(
    'feature',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IChangelog | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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
        body: JSON.stringify({
          title,
          content,
          type,
        }),
      })
      if (res.ok) {
        toast.success('변경 내역이 등록되었습니다.')
        setTitle('')
        setContent('')
        setType('feature')
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

  const handleEditClick = (changelog: IChangelog) => {
    setEditTarget(changelog)
    setTitle(changelog.title)
    setContent(changelog.content)
    setType(changelog.type || 'feature')
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editTarget || !title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/changelog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // eslint-disable-next-line no-underscore-dangle
          id: editTarget._id?.toString(),
          title,
          content,
          type,
        }),
      })
      if (res.ok) {
        toast.success('수정되었습니다.')
        setIsEditModalOpen(false)
        setEditTarget(null)
        setTitle('')
        setContent('')
        setType('feature')
        fetchChangelogs()
      } else {
        toast.error('수정에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to update changelog:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
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
                <Label htmlFor="type">타입</Label>
                <Select
                  value={type}
                  onValueChange={(
                    value: 'feature' | 'improvement' | 'bugfix',
                  ) => setType(value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">신규 기능</SelectItem>
                    <SelectItem value="improvement">개선</SelectItem>
                    <SelectItem value="bugfix">버그 수정</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <TableHead>타입</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelogs.map((changelog) => {
                  const getTypeBadgeForRow = (changelogType?: string) => {
                    switch (changelogType) {
                      case 'feature':
                        return <Badge className="bg-blue-500">신규 기능</Badge>
                      case 'improvement':
                        return <Badge className="bg-green-500">개선</Badge>
                      case 'bugfix':
                        return <Badge className="bg-red-500">버그 수정</Badge>
                      default:
                        return <Badge variant="outline">미분류</Badge>
                    }
                  }

                  return (
                    // eslint-disable-next-line no-underscore-dangle
                    <TableRow key={changelog._id?.toString()}>
                      <TableCell className="text-muted-foreground">
                        {dayjs(changelog.createdAt).format('YYYY-MM-DD')}
                      </TableCell>
                      <TableCell>
                        {getTypeBadgeForRow(changelog.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {changelog.title}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {changelog.content}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(changelog)}
                          >
                            <Pencil className="size-4" />
                          </Button>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>변경 내역 수정</DialogTitle>
            <DialogDescription>변경 내역을 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-type">타입</Label>
              <Select
                value={type}
                onValueChange={(value: 'feature' | 'improvement' | 'bugfix') =>
                  setType(value)
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">신규 기능</SelectItem>
                  <SelectItem value="improvement">개선</SelectItem>
                  <SelectItem value="bugfix">버그 수정</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                placeholder="예: 새로운 캐릭터 추가"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                placeholder="변경 내역을 상세히 작성해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditTarget(null)
                setTitle('')
                setContent('')
                setType('feature')
              }}
            >
              취소
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? '수정 중...' : '수정하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
