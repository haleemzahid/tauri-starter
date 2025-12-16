// AffixSelector - Row of affix buttons (Extra, No, Light, etc.)

import { cn } from '@/slices/shared/utils/cn'
import type { Affix } from '../shared/types'

interface AffixSelectorProps {
  affixes: Affix[]
  selectedAffix: Affix | null
  onSelect: (affix: Affix | null) => void
}

export function AffixSelector({
  affixes,
  selectedAffix,
  onSelect,
}: AffixSelectorProps) {
  if (affixes.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 border-b border-base-300 p-3">
      {affixes.map((affix) => (
        <button
          key={affix.id}
          onClick={() => onSelect(affix)}
          className={cn(
            'btn btn-sm',
            selectedAffix?.id === affix.id
              ? 'btn-info'
              : 'btn-outline btn-neutral'
          )}
        >
          {affix.name}
        </button>
      ))}
    </div>
  )
}
