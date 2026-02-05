'use client'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useTransitionRouter } from 'next-view-transitions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { CharacterNameInputModal } from '@/features/chat/components/character-name-input-modal'
import { Header } from '@/shared/components/header/header'
import { PageLayout } from '@/shared/components/layout/page-layout'
import { useModal } from '@/shared/hooks/use-modal'
import { ICharacterConfig } from '@/shared/types/database'
import { cn } from '@/shared/utils/cn'

type Gender = 'male' | 'female'

export function CharacterSelectView() {
  const router = useTransitionRouter()
  const { data: session } = useSession()
  const [selectedGender, setSelectedGender] = useState<Gender>('female')
  const [characters, setCharacters] = useState<ICharacterConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] =
    useState<ICharacterConfig | null>(null)
  const { isModalOpen, openModal, closeModal } = useModal()

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await fetch('/api/characters')
        if (res.ok) {
          const data = await res.json()
          setCharacters(data)
        }
      } catch (error) {
        console.error('Failed to fetch characters:', error)
        toast.error('캐릭터 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const filteredCharacters = characters.filter(
    (char) => char.gender === selectedGender,
  )

  const handleCharacterSelect = (char: ICharacterConfig) => {
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

        {isLoading ? (
          <div className={cn('flex flex-1 items-center justify-center')}>
            <p className={cn('text-gray-400')}>캐릭터 정보를 불러오는 중...</p>
          </div>
        ) : (
          filteredCharacters.map((char) => (
            <button
              key={char.type}
              type="button"
              onClick={() => handleCharacterSelect(char)}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 bg-white p-5 transition-all hover:shadow-md active:scale-[0.98]',
              )}
              style={{ borderColor: `${char.color}20` }}
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
                <p
                  className={cn('mt-0.5 text-xs leading-relaxed text-gray-500')}
                >
                  {char.description}
                </p>
              </div>
              <ChevronRight className={cn('size-5 text-gray-300')} />
            </button>
          ))
        )}

        {!isLoading && filteredCharacters.length === 0 && (
          <div className={cn('py-20 text-center text-gray-400')}>
            해당 성별의 캐릭터가 없습니다.
          </div>
        )}
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
