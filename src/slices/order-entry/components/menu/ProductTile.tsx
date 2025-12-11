// Product Tile - Colored button for products in menu

import { ColoredTile } from '../shared'
import type { Product } from '../../shared/types'
import { formatCurrency } from '../../shared/utils/pricing'

interface ProductTileProps {
  product: Product
  isSelected?: boolean
  onClick: () => void
}

export function ProductTile({
  product,
  isSelected = false,
  onClick,
}: ProductTileProps) {
  const displayName = product.displayName ?? product.name
  const showPrice = product.basePrice > 0

  return (
    <ColoredTile
      backColor={product.backColor}
      foreColor={product.foreColor}
      isSelected={isSelected}
      onClick={onClick}
      className="w-full min-h-[60px] flex-col gap-0.5"
    >
      <span className="text-center leading-tight line-clamp-2">
        {displayName}
      </span>
      {showPrice && (
        <span className="text-xs opacity-80">
          {formatCurrency(product.basePrice)}
        </span>
      )}
    </ColoredTile>
  )
}
