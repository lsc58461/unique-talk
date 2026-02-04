'use client'

import { useCallback, useRef, useState } from 'react'

export function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dimRef = useRef<HTMLDivElement>(null)

  const openModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return {
    isModalOpen,
    dimRef,
    openModal,
    closeModal,
  }
}
