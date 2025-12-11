// useModifierValidation - Checks if mandatory groups are satisfied

import { useMemo } from 'react'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import { useModifierSelections } from '../shared/store/modifier-atoms'

export interface ValidationResult {
  isValid: boolean
  unsatisfiedGroups: string[] // Category names that need selection
  unsatisfiedGroupIds: string[]
}

/**
 * Hook to validate if all mandatory modifier groups have selections.
 */
export function useModifierValidation(): ValidationResult {
  const product = useSelectedProduct()
  const selections = useModifierSelections()

  return useMemo(() => {
    const unsatisfiedGroups: string[] = []
    const unsatisfiedGroupIds: string[] = []

    if (!product?.toppingCategories) {
      return { isValid: true, unsatisfiedGroups, unsatisfiedGroupIds }
    }

    for (const category of product.toppingCategories) {
      if (category.isMandatory) {
        const categoryMods = selections.modifiersByCategory.get(category.id)
        if (!categoryMods || categoryMods.length === 0) {
          unsatisfiedGroups.push(category.name)
          unsatisfiedGroupIds.push(category.id)
        }
      }
    }

    return {
      isValid: unsatisfiedGroups.length === 0,
      unsatisfiedGroups,
      unsatisfiedGroupIds,
    }
  }, [product, selections])
}
