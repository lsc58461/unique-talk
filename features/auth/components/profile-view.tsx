'use client'

import {
  ArrowLeft,
  LogOut,
  UserMinus,
  ChevronRight,
  Loader2,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { useTransitionRouter } from 'next-view-transitions'
import { useState } from 'react'
import { toast } from 'sonner'

import { ChangelogSection } from '@/features/mypage/components/changelog-section'
import { TermsConsentSection } from '@/features/mypage/components/terms-consent-section'
import { Header } from '@/shared/components/header/header'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { ConfirmModal } from '@/shared/components/modal/confirm-modal'
import { Modal } from '@/shared/components/modal/modal'
import { Portal } from '@/shared/components/portal/portal'
import { useModal } from '@/shared/hooks/use-modal'
import { cn } from '@/shared/utils/cn'

export function ProfileView() {
  const router = useTransitionRouter()
  const { data: session, status } = useSession()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { isModalOpen, openModal, closeModal } = useModal()
  const {
    isModalOpen: isChangelogModalOpen,
    dimRef: changelogDimRef,
    openModal: openChangelogModal,
    closeModal: closeChangelogModal,
  } = useModal()

  if (status === 'loading') {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center bg-pink-50',
        )}
      >
        <Loader2
          className={cn('animate-spin text-base font-medium text-pink-500')}
        />
      </div>
    )
  }

  if (!session) {
    router.replace('/auth/login')
    return null
  }

  const { user } = session
  // @ts-ignore
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    toast.success('로그아웃되었습니다.')
    await signOut({ callbackUrl: '/auth/login' })
  }

  const handleWithdrawal = async () => {
    setIsWithdrawing(true)
    try {
      const response = await fetch('/api/auth/withdrawal', {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('탈퇴 처리가 완료되었습니다.')
        await signOut({ callbackUrl: '/auth/login' })
      } else {
        const data = await response.json()
        toast.error(data.error || '탈퇴 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error('탈퇴 처리 중 오류가 발생했습니다.')
    } finally {
      setIsWithdrawing(false)
      closeModal()
    }
  }

  return (
    <PageLayout>
      <div className={cn('flex h-full flex-col bg-pink-50/20')}>
        <Header
          left={
            <button
              onClick={() => router.back()}
              type="button"
              aria-label="뒤로 가기"
              className={cn(
                '-ml-2 rounded-full p-2 transition-colors hover:bg-gray-100',
              )}
            >
              <ArrowLeft className={cn('size-6 text-gray-600')} />
            </button>
          }
          center={<Header.Title>마이페이지</Header.Title>}
        />

        <div className={cn('flex flex-1 flex-col gap-10 overflow-y-auto p-6')}>
          {/* User Profile Section */}
          <div className={cn('flex flex-col items-center gap-5 pt-10 pb-4')}>
            <div
              className={cn(
                'relative size-28 overflow-hidden rounded-full border-4 border-white shadow-xl ring-1 ring-pink-100',
              )}
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || '프로필'}
                  fill
                  className={cn('object-cover')}
                />
              ) : (
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center bg-linear-to-br from-pink-100 to-pink-200',
                  )}
                >
                  <span className={cn('text-[30px] font-bold text-pink-400')}>
                    {user?.name?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className={cn('flex flex-col items-center gap-1')}>
              <h2 className={cn('text-2xl font-black text-gray-900')}>
                {user?.name}
              </h2>
              <p className={cn('text-sm font-medium text-gray-400')}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className={cn('flex flex-col gap-4')}>
            {isAdmin && (
              <>
                <h3
                  className={cn(
                    'px-2 text-xs font-bold tracking-wider text-gray-400 uppercase',
                  )}
                >
                  관리 도구
                </h3>
                <div
                  className={cn(
                    'flex flex-col gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-black/5',
                  )}
                >
                  <button
                    onClick={() => router.push('/admin')}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl p-3 transition-all hover:bg-blue-50/50 active:scale-[0.98]',
                    )}
                    type="button"
                  >
                    <div className={cn('flex items-center gap-3')}>
                      <div
                        className={cn(
                          'flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-white group-hover:shadow-sm',
                        )}
                      >
                        <ShieldCheck className={cn('size-4')} />
                      </div>
                      <span className={cn('text-sm font-bold text-gray-700')}>
                        관리자 페이지
                      </span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'size-4 text-gray-300 transition-transform group-hover:translate-x-0.5',
                      )}
                    />
                  </button>
                </div>
              </>
            )}

            <h3
              className={cn(
                'px-2 text-xs font-bold tracking-wider text-gray-400 uppercase',
              )}
            >
              계정 관리
            </h3>
            <div
              className={cn(
                'flex flex-col gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-black/5',
              )}
            >
              <button
                onClick={handleLogout}
                className={cn(
                  'group flex items-center justify-between rounded-2xl p-3 transition-all hover:bg-gray-50 active:scale-[0.98]',
                )}
                type="button"
              >
                <div className={cn('flex items-center gap-3')}>
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-white group-hover:shadow-sm',
                    )}
                  >
                    <LogOut className={cn('size-4')} />
                  </div>
                  <span className={cn('text-sm font-bold text-gray-700')}>
                    로그아웃
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    'size-4 text-gray-300 transition-transform group-hover:translate-x-0.5',
                  )}
                />
              </button>

              <div className={cn('mx-4 h-px bg-gray-50')} />

              <button
                onClick={openModal}
                disabled={isWithdrawing}
                className={cn(
                  'group flex items-center justify-between rounded-2xl p-3 transition-all hover:bg-red-50/50 active:scale-[0.98]',
                  isWithdrawing && 'opacity-50',
                )}
                type="button"
              >
                <div className={cn('flex items-center gap-3')}>
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors group-hover:bg-white group-hover:shadow-sm',
                    )}
                  >
                    <UserMinus className={cn('size-4')} />
                  </div>
                  <span className={cn('text-sm font-bold text-red-500')}>
                    회원 탈퇴
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    'size-4 text-red-200 transition-transform group-hover:translate-x-0.5',
                  )}
                />
              </button>
            </div>

            <h3
              className={cn(
                'px-2 text-xs font-bold tracking-wider text-gray-400 uppercase',
              )}
            >
              약관 동의 정보
            </h3>
            <TermsConsentSection />

            <h3
              className={cn(
                'px-2 text-xs font-bold tracking-wider text-gray-400 uppercase',
              )}
            >
              앱 정보
            </h3>
            <div
              className={cn(
                'flex flex-col gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-black/5',
              )}
            >
              <button
                onClick={openChangelogModal}
                className={cn(
                  'group flex items-center justify-between rounded-2xl p-3 transition-all hover:bg-gray-50 active:scale-[0.98]',
                )}
                type="button"
              >
                <div className={cn('flex items-center gap-3')}>
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-white group-hover:shadow-sm',
                    )}
                  >
                    <FileText className={cn('size-4')} />
                  </div>
                  <span className={cn('text-sm font-bold text-gray-700')}>
                    변경 내역
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    'size-4 text-gray-300 transition-transform group-hover:translate-x-0.5',
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleWithdrawal}
        title="회원 탈퇴"
        description={`정말로 탈퇴하시겠습니까?\n그동안의 대화 내역이 모두 삭제됩니다.`}
        confirmText="탈퇴하기"
        isDestructive
        isLoading={isWithdrawing}
      />

      <Portal isPortalOpen={isChangelogModalOpen}>
        <Modal.Dim dimRef={changelogDimRef} onDimClick={closeChangelogModal}>
          <Modal>
            <Modal.Header text="변경 내역" onCloseClick={closeChangelogModal} />
            <div className={cn('max-h-[70vh] overflow-y-auto p-4')}>
              <ChangelogSection />
            </div>
          </Modal>
        </Modal.Dim>
      </Portal>
    </PageLayout>
  )
}
