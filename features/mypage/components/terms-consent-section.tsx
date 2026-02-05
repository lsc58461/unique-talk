'use client'

import { FileText, Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { useTermsConsentInfo } from '@/shared/hooks/use-terms-consent-info'
import { cn } from '@/shared/utils/cn'

export function TermsConsentSection() {
  const { consentInfo, isLoading } = useTermsConsentInfo()

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8')}>
        <div className={cn('text-sm text-gray-400')}>로딩 중...</div>
      </div>
    )
  }

  if (!consentInfo) {
    return (
      <div className={cn('flex items-center justify-center py-8')}>
        <div className={cn('text-sm text-gray-400')}>
          약관 동의 정보가 없습니다.
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={cn('flex flex-col gap-3')}>
      {/* 서비스 이용약관 */}
      <div
        className={cn(
          'flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5',
        )}
      >
        <div className={cn('flex items-start justify-between')}>
          <div className={cn('flex items-start gap-3')}>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600',
              )}
            >
              <FileText className={cn('size-4')} />
            </div>
            <div className={cn('flex flex-col gap-1')}>
              <h4 className={cn('text-sm font-bold text-gray-900')}>
                서비스 이용약관
              </h4>
              <p className={cn('text-xs text-gray-500')}>
                버전 {consentInfo.termsVersion}
              </p>
            </div>
          </div>
          <Link
            href="/terms"
            target="_blank"
            className={cn('text-xs font-medium text-blue-600 hover:underline')}
          >
            보기
          </Link>
        </div>

        <div
          className={cn('flex items-center gap-2 rounded-lg bg-gray-50 p-3')}
        >
          <CheckCircle2 className={cn('size-4 text-green-600')} />
          <div className={cn('flex flex-1 items-center gap-2')}>
            <Calendar className={cn('size-3.5 text-gray-400')} />
            <span className={cn('text-xs text-gray-600')}>
              {formatDate(consentInfo.termsConsentedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* 개인정보 처리방침 */}
      <div
        className={cn(
          'flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5',
        )}
      >
        <div className={cn('flex items-start justify-between')}>
          <div className={cn('flex items-start gap-3')}>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600',
              )}
            >
              <FileText className={cn('size-4')} />
            </div>
            <div className={cn('flex flex-col gap-1')}>
              <h4 className={cn('text-sm font-bold text-gray-900')}>
                개인정보 처리방침
              </h4>
              <p className={cn('text-xs text-gray-500')}>
                버전 {consentInfo.privacyVersion}
              </p>
            </div>
          </div>
          <Link
            href="/privacy"
            target="_blank"
            className={cn(
              'text-xs font-medium text-purple-600 hover:underline',
            )}
          >
            보기
          </Link>
        </div>

        <div
          className={cn('flex items-center gap-2 rounded-lg bg-gray-50 p-3')}
        >
          <CheckCircle2 className={cn('size-4 text-green-600')} />
          <div className={cn('flex flex-1 items-center gap-2')}>
            <Calendar className={cn('size-3.5 text-gray-400')} />
            <span className={cn('text-xs text-gray-600')}>
              {formatDate(consentInfo.privacyConsentedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
