'use client'

import { Save, FileText, Shield } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminLayout } from '@/features/admin/components/admin-layout'
import { cn } from '@/shared/utils/cn'
import type { ITermsDocument } from '@/types/terms-document'

const MdxEditor = dynamic(
  () =>
    import('@/components/ui/mdx-editor').then((mod) => ({
      default: mod.MdxEditor,
    })),
  { ssr: false },
)

type TermsType = 'terms' | 'privacy'

export default function AdminTermsPage() {
  const [activeTab, setActiveTab] = useState<TermsType>('terms')
  const [version, setVersion] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadDocument = async (type: TermsType) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/terms-documents?type=${type}`)
      if (response.ok) {
        const data: ITermsDocument = await response.json()
        if (data) {
          setVersion(data.version)
          setEffectiveDate(data.effectiveDate)
          setContent(data.content)
        } else {
          setVersion('1.0.0')
          setEffectiveDate(new Date().toISOString().split('T')[0])
          setContent('')
        }
      }
    } catch (error) {
      console.error('약관 로드 실패:', error)
      toast.error('약관을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocument(activeTab)
  }, [activeTab])

  const handleSave = async () => {
    if (!version || !effectiveDate || !content) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/terms-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: activeTab,
          version,
          effectiveDate,
          content,
        }),
      })

      if (response.ok) {
        toast.success('약관이 저장되었습니다.')
      } else {
        const data = await response.json()
        toast.error(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('약관 저장 실패:', error)
      toast.error('약관 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TermsType)}
      >
        <TabsList className={cn('mb-6')}>
          <TabsTrigger value="terms" className={cn('flex items-center gap-2')}>
            <FileText className={cn('size-4')} />
            서비스 이용약관
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className={cn('flex items-center gap-2')}
          >
            <Shield className={cn('size-4')} />
            개인정보 처리방침
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className={cn('space-y-6')}>
          {/* Form */}
          <div className={cn('flex gap-4')}>
            <div className={cn('flex-1')}>
              <label
                htmlFor="version"
                className={cn('mb-2 block text-sm font-medium text-gray-700')}
              >
                버전
              </label>
              <input
                id="version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className={cn(
                  'w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                )}
              />
            </div>
            <div className={cn('flex-1')}>
              <label
                htmlFor="effectiveDate"
                className={cn('mb-2 block text-sm font-medium text-gray-700')}
              >
                시행일
              </label>
              <input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className={cn(
                  'w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                )}
              />
            </div>
          </div>

          {/* Editor */}
          <div className={cn('mb-6')}>
            <label
              className={cn('mb-2 block text-sm font-medium text-gray-700')}
            >
              내용 (마크다운)
            </label>
            <MdxEditor
              key={`${activeTab}-${version}`}
              value={content}
              onChange={(val: string) => setContent(val)}
              placeholder="마크다운 형식으로 약관을 작성하세요..."
            />
          </div>

          {/* Actions */}
          <div className={cn('flex justify-end gap-3')}>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={cn(
                'flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50',
              )}
              type="button"
            >
              <Save className={cn('size-4')} />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
