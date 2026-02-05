'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({
  id,
  checked = false,
  onCheckedChange,
  className,
}: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        'size-20pxr cursor-pointer rounded border-2 border-gray-300 accent-blue-600',
        className,
      )}
    />
  )
}
