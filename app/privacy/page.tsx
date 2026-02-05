'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'
import type { ITermsDocument } from '@/types/terms-document'

export default function PrivacyPage() {
  const [document, setDocument] = useState<ITermsDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const response = await fetch('/api/terms-documents/privacy')
        if (response.ok) {
          const data = await response.json()
          setDocument(data)
        }
      } catch (error) {
        console.error('약관 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [])

  if (isLoading) {
    return (
      <div className={cn('flex min-h-screen items-center justify-center')}>
        <div className={cn('text-gray-500')}>로딩 중...</div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className={cn('flex min-h-screen items-center justify-center')}>
        <div className={cn('text-gray-500')}>약관을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className={cn('mx-auto max-w-4xl px-4 py-8')}>
      <div className={cn('mb-8')}>
        <h1 className={cn('mb-2 text-3xl font-bold')}>개인정보 처리방침</h1>
        <div className={cn('flex gap-4 text-sm text-gray-500')}>
          <span>버전 {document.version}</span>
          <span>시행일: {document.effectiveDate}</span>
        </div>
      </div>

      <div
        className={cn(
          'prose prose-gray prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-li:text-gray-700 max-w-none',
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {document.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
