'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { CharacterType } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

interface AddCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (character: {
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
  }) => void
  existingTypes: CharacterType[]
}

export function AddCharacterModal({
  isOpen,
  onClose,
  onAdd,
  existingTypes,
}: AddCharacterModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    gender: 'female' as 'male' | 'female',
    title: '',
    description: '',
    baseAffection: 20,
    baseJealousy: 0,
    baseTrust: 60,
    systemPrompt: '',
    imageUrl: '',
    color: '#9333ea',
    bgColor: '#f3e8ff',
    borderColor: '#e9d5ff',
    isActive: true,
  })

  const handleSubmit = () => {
    if (!formData.type.trim()) {
      toast.error('캐릭터 타입을 입력해주세요.')
      return
    }

    if (existingTypes.includes(formData.type as CharacterType)) {
      toast.error('이미 존재하는 캐릭터 타입입니다.')
      return
    }

    if (!formData.title.trim()) {
      toast.error('캐릭터 제목을 입력해주세요.')
      return
    }

    onAdd(formData)
    setFormData({
      type: '',
      gender: 'female',
      title: '',
      description: '',
      baseAffection: 20,
      baseJealousy: 0,
      baseTrust: 60,
      systemPrompt: '',
      imageUrl: '',
      color: '#9333ea',
      bgColor: '#f3e8ff',
      borderColor: '#e9d5ff',
      isActive: true,
    })
    onClose()
  }

  const handleClose = () => {
    setFormData({
      type: '',
      gender: 'female',
      title: '',
      description: '',
      baseAffection: 20,
      baseJealousy: 0,
      baseTrust: 60,
      systemPrompt: '',
      imageUrl: '',
      color: '#9333ea',
      bgColor: '#f3e8ff',
      borderColor: '#e9d5ff',
      isActive: true,
    })
    onClose()
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      'systemPrompt',
    ) as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.systemPrompt
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = before + variable + after
    setFormData({ ...formData, systemPrompt: newText })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length,
      )
    }, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 캐릭터 추가</DialogTitle>
          <DialogDescription>
            새로운 캐릭터의 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">캐릭터 타입 (영문, 고유값)</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="예: my_character"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">성별</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as 'male' | 'female',
                  })
                }
                className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
              >
                <option value="female">여성</option>
                <option value="male">남성</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="예: 집착하는 여친"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="예: 당신의 모든 일상을 소유하고 싶어 하는 그녀"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseAffection">초기 호감도</Label>
              <Input
                id="baseAffection"
                type="number"
                value={formData.baseAffection}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseAffection: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseJealousy">초기 질투심</Label>
              <Input
                id="baseJealousy"
                type="number"
                value={formData.baseJealousy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseJealousy: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseTrust">초기 신뢰도</Label>
              <Input
                id="baseTrust"
                type="number"
                value={formData.baseTrust}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseTrust: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bgColor">배경색</Label>
              <Input
                id="bgColor"
                value={formData.bgColor}
                onChange={(e) =>
                  setFormData({ ...formData, bgColor: e.target.value })
                }
                placeholder="#f3e8ff"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">강조색</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#9333ea"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderColor">테두리색</Label>
              <Input
                id="borderColor"
                value={formData.borderColor}
                onChange={(e) =>
                  setFormData({ ...formData, borderColor: e.target.value })
                }
                placeholder="#e9d5ff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="systemPrompt">시스템 프롬프트 (페르소나)</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => insertVariable('{characterName}')}
                  className={cn('text-xs')}
                >
                  {'{characterName}'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => insertVariable('{genderTerm}')}
                  className={cn('text-xs')}
                >
                  {'{genderTerm}'}
                </Button>
              </div>
            </div>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, systemPrompt: e.target.value })
              }
              placeholder="캐릭터의 성격과 말투를 설명해주세요...&#10;&#10;사용 가능한 변수:&#10;- {characterName}: 캐릭터 이름으로 치환됩니다&#10;- {genderTerm}: 성별에 맞는 호칭(그녀/그)으로 치환됩니다"
              className="min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
