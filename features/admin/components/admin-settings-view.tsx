'use client'

import { Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminLayout } from '@/features/admin/components/admin-layout'
import { IAdminConfig } from '@/shared/types/database'

const AI_MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
] as const

export function AdminSettingsView() {
  const [config, setConfig] = useState<IAdminConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch config:', err)
        toast.error('설정을 불러오는데 실패했습니다.')
        setIsLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!config) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        toast.success('설정이 저장되었습니다.')
      } else {
        toast.error('설정 저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to save config:', err)
      toast.error('오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
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
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="mr-2 size-4" />
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* AI Model Setting */}
          <Card>
            <CardHeader>
              <CardTitle>AI 모델 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiModel">사용할 AI 모델</Label>
                <select
                  id="aiModel"
                  value={config?.aiModel}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev ? { ...prev, aiModel: e.target.value } : null,
                    )
                  }
                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Emotion Bonus Setting */}
          <Card>
            <CardHeader>
              <CardTitle>감정 보너스 계수</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affectionBonus">호감도 보너스</Label>
                <Input
                  id="affectionBonus"
                  type="number"
                  step="0.1"
                  value={config?.affectionBonus ?? 1.0}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            affectionBonus: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jealousyBonus">질투심 보너스</Label>
                <Input
                  id="jealousyBonus"
                  type="number"
                  step="0.1"
                  value={config?.jealousyBonus ?? 1.0}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            jealousyBonus: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trustBonus">신뢰도 보너스</Label>
                <Input
                  id="trustBonus"
                  type="number"
                  step="0.1"
                  value={config?.trustBonus ?? 1.0}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            trustBonus: parseFloat(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>
              <p className="text-muted-foreground text-xs">
                감정 변화량에 곱해지는 계수입니다. (기본값: 1.0)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
