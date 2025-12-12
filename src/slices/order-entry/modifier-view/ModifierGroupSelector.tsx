// ModifierGroupSelector - Grid of modifier group buttons

import { cn } from '@/slices/shared/utils/cn'
import { useEditingItem, useEditingProduct } from '../shared/machines'
import type { ToppingCategory } from '../shared/types'

interface ModifierGroupSelectorProps {
  activeCategory: ToppingCategory | null
  onSelectCategory: (category: ToppingCategory) => void
}

export function ModifierGroupSelector({
  activeCategory,
  onSelectCategory,
}: ModifierGroupSelectorProps) {
  const product = useEditingProduct()
  const item = useEditingItem()

  const categories = product?.toppingCategories ?? []

  // Count modifiers per category from cart item
  const getModifierCount = (categoryId: string): number => {
    if (!item) return 0
    // Get toppings that belong to this category
    const category = categories.find((c) => c.id === categoryId)
    if (!category?.toppings) return 0
    const toppingIds = new Set(category.toppings.map((t) => t.id))
    return item.modifiers.filter((m) => toppingIds.has(m.topping.id)).length
  }

  // Check if category is unsatisfied (mandatory with no selections)
  const isUnsatisfied = (category: ToppingCategory): boolean => {
    if (!category.isMandatory) return false
    return getModifierCount(category.id) === 0
  }

  if (categories.length === 0) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No modifier groups available
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => {
          const isActive = activeCategory?.id === category.id
          const modCount = getModifierCount(category.id)
          const hasSelections = modCount > 0
          const unsatisfied = isUnsatisfied(category)

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={cn(
                'btn h-16 text-lg',
                isActive
                  ? 'btn-info text-info-content'
                  : hasSelections
                    ? 'btn-neutral text-neutral-content'
                    : 'bg-base-300 text-base-content/60',
                unsatisfied && !isActive && 'ring-2 ring-error'
              )}
            >
              <span className="flex flex-col items-center">
                <span>{category.name}</span>
                {category.isMandatory && !hasSelections && (
                  <span className="text-xs text-error">Required</span>
                )}
                {hasSelections && (
                  <span className="text-xs opacity-70">
                    ({modCount} selected)
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
