// Menu Tile - Colored button for menus (top-level)

import { ColoredTile } from '../shared'
import type { Menu } from '../../shared/types'

interface MenuTileProps {
  menu: Menu
  isSelected?: boolean
  onClick: () => void
}

export function MenuTile({ menu, isSelected = false, onClick }: MenuTileProps) {
  const displayName = menu.displayName ?? menu.name

  return (
    <ColoredTile
      backColor={menu.backColor}
      foreColor={menu.foreColor}
      isSelected={isSelected}
      onClick={onClick}
      className="w-full min-h-12"
    >
      <span className="text-center leading-tight">{displayName}</span>
    </ColoredTile>
  )
}
