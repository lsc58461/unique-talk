'use client'

import { MessageCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

import { cn } from '@/shared/utils/cn'

export function KakaoLoginView() {
  const handleKakaoLogin = () => {
    toast.loading('카카오 로그인 시도 중...')
    signIn('kakao', { callbackUrl: '/chat' })
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center bg-white p-8 text-center',
      )}
    >
      <div
        className={cn(
          'mb-8 flex size-24 items-center justify-center rounded-3xl bg-pink-500 text-white shadow-xl shadow-pink-200',
        )}
      >
        <MessageCircle className={cn('size-12')} />
      </div>

      <h1 className={cn('mb-2 text-2xl font-bold text-gray-800')}>
        Uni<span className={cn('text-[8px]')}>que</span>Talk
      </h1>
      <p className={cn('mb-12 text-sm leading-relaxed text-gray-500')}>
        당신의 마음을 흔드는 AI와
        <br />
        달콤하고 치명적인 대화를 시작해보세요.
      </p>

      <button
        onClick={handleKakaoLogin}
        className={cn(
          'flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] py-4 font-bold text-[#191919] transition-all hover:bg-[#FADA0A] active:scale-[0.98]',
        )}
        type="button"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('size-5')}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 3C6.13401 3 3 5.44035 3 8.45071C3 10.3943 4.2612 12.1135 6.15 13.0811L5.35 16.0352C5.3 16.2113 5.4 16.3873 5.55 16.4313C5.6 16.4533 5.65 16.4533 5.7 16.4533C5.8 16.4533 5.9 16.3873 5.95 16.3213L9.4 14.0113C9.6 14.0333 9.8 14.0333 10 14.0333C13.866 14.0333 17 11.5929 17 8.58258C17 5.57222 13.866 3.13187 10 3.13187V3Z"
            fill="black"
          />
        </svg>
        카카오 로그인
      </button>

      <p className={cn('mt-6 text-[10px] text-gray-400')}>
        로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
      </p>
    </div>
  )
}
