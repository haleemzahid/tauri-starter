// Category Tile - Colored button for menu categories

import { ColoredTile } from '../shared'
import type { MenuCategory } from '../../shared/types'

interface CategoryTileProps {
  category: MenuCategory
  isSelected?: boolean
  onClick: () => void
}

export function CategoryTile({
  category,
  isSelected = false,
  onClick,
}: CategoryTileProps) {
  const displayName = category.displayName ?? category.name

  return (
    <ColoredTile
      backColor={category.backColor}
      foreColor={category.foreColor}
      isSelected={isSelected}
      onClick={onClick}
      className="w-full min-h-12"
    >
      <span className="text-center leading-tight">{displayName}</span>
    </ColoredTile>
  )
}
