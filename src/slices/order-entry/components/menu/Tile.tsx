// Tile - Unified colored tile for menus, categories, and products

import { ColoredTile } from '../shared'
import { formatCurrency } from '../../shared/utils/pricing'

interface TileItem {
  name: string
  displayName?: string | null
  backColor?: string | null
  foreColor?: string | null
  basePrice?: number | string
}

interface TileProps {
  item: TileItem
  isSelected?: boolean
  showPrice?: boolean
  onClick: () => void
}

export function Tile({
  item,
  isSelected = false,
  showPrice = false,
  onClick,
}: TileProps) {
  const displayName = item.displayName ?? item.name
  const hasPrice = showPrice && item.basePrice && Number(item.basePrice) > 0

  return (
    <ColoredTile
      backColor={item.backColor}
      foreColor={item.foreColor}
      isSelected={isSelected}
      onClick={onClick}
      className={`w-full ${hasPrice ? 'min-h-[60px] flex-col gap-0.5' : 'min-h-12'}`}
    >
      <span className="text-center leading-tight line-clamp-2">
        {displayName}
      </span>
      {hasPrice && (
        <span className="text-xs opacity-80">
          {formatCurrency(item.basePrice ?? 0)}
        </span>
      )}
    </ColoredTile>
  )
}
