'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  isPortalOpen: boolean
}

export function Portal({ children, isPortalOpen }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isPortalOpen) return null

  return createPortal(children, document.body)
}
