'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ICharacterConfig } from '@/shared/types/database'

interface EditCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  character: ICharacterConfig | null
  onSave: (character: ICharacterConfig) => void
}

export function EditCharacterModal({
  isOpen,
  onClose,
  character,
  onSave,
}: EditCharacterModalProps) {
  const [formData, setFormData] = useState<ICharacterConfig | null>(null)

  useEffect(() => {
    if (character) {
      setFormData({ ...character })
    }
  }, [character])

  const handleSave = () => {
    if (!formData) return
    onSave(formData)
  }

  const insertVariable = (variable: string) => {
    if (!formData) return
    const textarea = document.querySelector(
      'textarea[name="systemPrompt"]',
    ) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.systemPrompt
    const before = text.substring(0, start)
    const after = text.substring(end)

    setFormData({
      ...formData,
      systemPrompt: before + variable + after,
    })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length,
      )
    }, 0)
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>캐릭터 수정 - {formData.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="space-y-2">
            <Label htmlFor="title">캐릭터 이름</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
            />
          </div>

          {/* 초기 스탯 */}
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
                    baseAffection: Number(e.target.value),
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
                    baseJealousy: Number(e.target.value),
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
                    baseTrust: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* 시스템 프롬프트 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="systemPrompt">시스템 프롬프트</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('{characterName}')}
                >
                  {'{characterName}'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('{genderTerm}')}
                >
                  {'{genderTerm}'}
                </Button>
              </div>
            </div>
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, systemPrompt: e.target.value })
              }
              rows={8}
            />
          </div>

          {/* 스타일 설정 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">색상</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bgColor">배경색</Label>
              <Input
                id="bgColor"
                value={formData.bgColor}
                onChange={(e) =>
                  setFormData({ ...formData, bgColor: e.target.value })
                }
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
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
