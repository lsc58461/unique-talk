'use client'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useTransitionRouter } from 'next-view-transitions'
import { useState } from 'react'
import { toast } from 'sonner'

import { CharacterNameInputModal } from '@/features/chat/components/character-name-input-modal'
import { Header } from '@/shared/components/header/header'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { useModal } from '@/shared/hooks/use-modal'
import { CharacterType } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

type Gender = 'male' | 'female'

const CHARACTERS: {
  type: CharacterType
  gender: Gender
  title: string
  description: string
  imageUrl: string
  color: string
  bgColor: string
  borderColor: string
}[] = [
  // Female Characters
  {
    type: 'obsessive',
    gender: 'female',
    title: '집착하는 여친',
    description: '당신의 모든 일상을 소유하고 싶어 하는 그녀',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    color: '#9333ea', // purple-600
    bgColor: '#a855f7', // purple-500
    borderColor: '#f3e8ff', // purple-100
  },
  {
    type: 'tsundere',
    gender: 'female',
    title: '츤데레 여친',
    description: '겉으론 차갑지만 속으론 누구보다 당신을 생각하는 그녀',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    color: '#ca8a04', // yellow-600
    bgColor: '#fefce8', // yellow-50
    borderColor: '#fef9c3', // yellow-100
  },
  {
    type: 'pure',
    gender: 'female',
    title: '순정파 여친',
    description: '맑고 투명한 마음으로 당신만을 바라보는 그녀',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    color: '#db2777', // pink-600
    bgColor: '#fdf2f8', // pink-50
    borderColor: '#fce7f3', // pink-100
  },
  {
    type: 'makjang',
    gender: 'female',
    title: '막장 드라마 여주',
    description: '감정 기복이 심하고 드라마틱한 관계를 즐기는 그녀',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
    borderColor: '#fee2e2', // red-100
  },
  // Male Characters
  {
    type: 'younger_powerful',
    gender: 'male',
    title: '박력연하남',
    description: '나이는 어려도 리드는 확실하게, 직진하는 그',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
    borderColor: '#ffedd5', // orange-100
  },
  {
    type: 'younger_cute',
    gender: 'male',
    title: '큐티연하남',
    description: '강아지 같은 눈망울로 당신의 사랑을 갈구하는 그',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    color: '#0891b2', // cyan-600
    bgColor: '#ecfeff', // cyan-50
    borderColor: '#cffafe', // cyan-100
  },
  {
    type: 'older_sexy',
    gender: 'male',
    title: '섹시연상남',
    description: '여유로운 미소 뒤에 치명적인 매력을 숨긴 그',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    color: '#4f46e5', // indigo-600
    bgColor: '#eef2ff', // indigo-50
    borderColor: '#e0e7ff', // indigo-100
  },
]

export function CharacterSelectView() {
  const router = useTransitionRouter()
  const { data: session } = useSession()
  const [selectedGender, setSelectedGender] = useState<Gender>('female')
  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof CHARACTERS)[0] | null
  >(null)
  const { isModalOpen, openModal, closeModal } = useModal()

  const filteredCharacters = CHARACTERS.filter(
    (char) => char.gender === selectedGender,
  )

  const handleCharacterSelect = (char: (typeof CHARACTERS)[0]) => {
    setSelectedCharacter(char)
    openModal()
  }

  const handleCreateRoom = async (name: string) => {
    // @ts-ignore
    const userId = session?.user?.id
    if (!selectedCharacter || !userId) return

    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          characterType: selectedCharacter.type,
          gender: selectedCharacter.gender,
          name,
          imageUrl: selectedCharacter.imageUrl,
          color: selectedCharacter.color,
          bgColor: selectedCharacter.bgColor,
        }),
      })

      if (response.ok) {
        toast.success(`${name}와(과)의 새로운 대화가 시작되었습니다!`)
        router.push('/chat')
      } else {
        toast.error('채팅방 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create room:', error)
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <PageLayout>
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
        center={<Header.Title>캐릭터 선택</Header.Title>}
      />

      {/* Gender Tabs */}
      <div className={cn('flex gap-2 p-4')}>
        <button
          type="button"
          onClick={() => setSelectedGender('female')}
          className={cn(
            'flex-1 rounded-xl py-3 font-bold transition-all',
            selectedGender === 'female'
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-100'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
          )}
        >
          여성 캐릭터
        </button>
        <button
          type="button"
          onClick={() => setSelectedGender('male')}
          className={cn(
            'flex-1 rounded-xl py-3 font-bold transition-all',
            selectedGender === 'male'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-100'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
          )}
        >
          남성 캐릭터
        </button>
      </div>

      <div
        className={cn('flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-2')}
      >
        <p className={cn('mb-2 text-sm text-gray-500')}>
          대화하고 싶은 캐릭터 유형을 선택해주세요.
        </p>

        {filteredCharacters.map((char) => (
          <button
            key={char.type}
            type="button"
            onClick={() => handleCharacterSelect(char)}
            className={cn(
              'flex items-center gap-4 rounded-2xl border-2 bg-white p-5 transition-all hover:shadow-md active:scale-[0.98]',
            )}
            style={{ borderColor: char.borderColor }}
          >
            <div
              className={cn(
                'relative flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 shadow-sm',
              )}
            >
              <Image
                src={char.imageUrl}
                alt={char.title}
                fill
                className={cn('object-cover')}
              />
            </div>
            <div className={cn('flex-1 text-left')}>
              <h3 className={cn('text-lg font-bold text-gray-800')}>
                {char.title}
              </h3>
              <p className={cn('mt-0.5 text-xs leading-relaxed text-gray-500')}>
                {char.description}
              </p>
            </div>
            <ChevronRight className={cn('size-5 text-gray-300')} />
          </button>
        ))}
      </div>

      <CharacterNameInputModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={handleCreateRoom}
        characterType={selectedCharacter?.type || null}
        imageUrl={selectedCharacter?.imageUrl}
        title={selectedCharacter?.title}
        color={selectedCharacter?.color}
        bgColor={selectedCharacter?.bgColor}
      />
    </PageLayout>
  )
}
