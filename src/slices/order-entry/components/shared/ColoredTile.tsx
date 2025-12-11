// Colored Tile - Base component for menu items, products, toppings
// Uses dynamic colors from database

import { type ReactNode } from 'react'

interface ColoredTileProps {
  backColor: string
  foreColor: string
  children: ReactNode
  isSelected?: boolean
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function ColoredTile({
  backColor,
  foreColor,
  children,
  isSelected = false,
  onClick,
  className = '',
  disabled = false,
}: ColoredTileProps) {
  // Default colors if not provided
  const bgColor = backColor || '#374151' // gray-700
  const fgColor = foreColor || '#ffffff'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        color: fgColor,
      }}
      className={`
        flex items-center justify-center
        min-h-[48px] px-3 py-2
        rounded-lg font-medium text-sm
        transition-all duration-150
        touch-manipulation select-none
        ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-base-100 scale-[0.98]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
