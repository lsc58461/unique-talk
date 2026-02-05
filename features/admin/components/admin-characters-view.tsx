'use client'

import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddCharacterModal } from '@/features/admin/components/add-character-modal'
import { AdminLayout } from '@/features/admin/components/admin-layout'
import { EditCharacterModal } from '@/features/admin/components/edit-character-modal'
import { ConfirmModal } from '@/shared/components/modal/confirm-modal'
import { ICharacterConfig, CharacterType } from '@/shared/types/database'

export function AdminCharactersView() {
  const [characters, setCharacters] = useState<ICharacterConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<CharacterType | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] =
    useState<ICharacterConfig | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/admin/characters')
      const data = await res.json()
      setCharacters(data)
    } catch (err) {
      console.error('Failed to fetch characters:', err)
      toast.error('캐릭터 정보를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [])

  const handleEditClick = (character: ICharacterConfig) => {
    setEditingCharacter(character)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (updatedCharacter: ICharacterConfig) => {
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { _id, ...characterData } = updatedCharacter
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
      })
      if (res.ok) {
        toast.success('저장되었습니다.')
        await fetchCharacters()
        setIsEditModalOpen(false)
        setEditingCharacter(null)
      } else {
        toast.error('저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to save character:', err)
      toast.error('오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (
    character: ICharacterConfig,
    isActive: boolean,
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { _id, ...characterData } = character
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...characterData, isActive }),
      })
      if (res.ok) {
        toast.success(`${isActive ? '활성화' : '비활성화'}되었습니다.`)
        fetchCharacters()
      } else {
        toast.error('저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to toggle active:', err)
      toast.error('오류가 발생했습니다.')
    }
  }

  const handleDeleteClick = (type: CharacterType) => {
    setDeleteTarget(type)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/characters?type=${deleteTarget}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('삭제되었습니다.')
        fetchCharacters()
      } else {
        toast.error('삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to delete character:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteTarget(null)
    }
  }

  const handleResetDefaults = () => {
    setIsResetModalOpen(true)
  }

  const confirmResetDefaults = async () => {
    try {
      const res = await fetch('/api/admin/characters', {
        method: 'PUT',
      })
      if (res.ok) {
        toast.success('기본값으로 복원되었습니다.')
        fetchCharacters()
      } else {
        toast.error('복원에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to reset defaults:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsResetModalOpen(false)
    }
  }

  const handleConfirmAdd = async (newCharacter: {
    type: string
    gender: 'male' | 'female'
    title: string
    description: string
    baseAffection: number
    baseJealousy: number
    baseTrust: number
    systemPrompt: string
    imageUrl: string
    color: string
    bgColor: string
    borderColor: string
    isActive: boolean
  }) => {
    try {
      const characterToAdd = {
        ...newCharacter,
        type: newCharacter.type as CharacterType,
      }

      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterToAdd),
      })
      if (res.ok) {
        toast.success('추가되었습니다.')
        fetchCharacters()
      } else {
        toast.error('추가에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to add character:', err)
      toast.error('오류가 발생했습니다.')
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">캐릭터 관리</h2>
            <p className="text-muted-foreground text-sm">
              각 캐릭터를 클릭하여 수정할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetDefaults}>
              <RotateCcw className="mr-2 size-4" />
              기본값 복원
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 size-4" />
              캐릭터 추가
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>캐릭터 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>노출</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>성별</TableHead>
                  <TableHead className="text-center">초기 호감도</TableHead>
                  <TableHead className="text-center">초기 질투심</TableHead>
                  <TableHead className="text-center">초기 신뢰도</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((character) => (
                  <TableRow key={character.type}>
                    <TableCell>
                      <Switch
                        checked={character.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(character, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {character.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {character.description}
                    </TableCell>
                    <TableCell>
                      {character.gender === 'male' ? '남성' : '여성'}
                    </TableCell>
                    <TableCell className="text-center">
                      {character.baseAffection}
                    </TableCell>
                    <TableCell className="text-center">
                      {character.baseJealousy}
                    </TableCell>
                    <TableCell className="text-center">
                      {character.baseTrust}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(character)}
                        >
                          <Edit className="mr-1 size-3" />
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(character.type)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="캐릭터 삭제"
        description="정말로 이 캐릭터를 삭제하시겠습니까?"
        confirmText="삭제하기"
        isDestructive
      />

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmResetDefaults}
        title="기본값으로 복원"
        description="모든 캐릭터 설정을 기본값으로 초기화하시겠습니까? 현재의 모든 변경사항이 유실됩니다."
        confirmText="복원하기"
        isDestructive
      />

      <AddCharacterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleConfirmAdd}
        existingTypes={characters.map((c) => c.type)}
      />

      <EditCharacterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCharacter(null)
        }}
        character={editingCharacter}
        onSave={handleSaveEdit}
      />
    </AdminLayout>
  )
}
