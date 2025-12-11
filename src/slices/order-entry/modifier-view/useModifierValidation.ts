// useModifierValidation - Checks if size and mandatory groups are satisfied

import { useMemo } from 'react'
import { useSelectedProduct } from '../shared/store/ui-atoms'
import { useModifierSelections } from '../shared/store/modifier-atoms'

export interface ValidationResult {
  isValid: boolean
  isSizeRequired: boolean
  unsatisfiedGroups: string[] // Category names that need selection
  unsatisfiedGroupIds: string[]
}

/**
 * Hook to validate if size is selected and all mandatory modifier groups have selections.
 */
export function useModifierValidation(): ValidationResult {
  const product = useSelectedProduct()
  const selections = useModifierSelections()

  return useMemo(() => {
    const unsatisfiedGroups: string[] = []
    const unsatisfiedGroupIds: string[] = []

    // Check if size is required
    const hasSizes = (product?.assignedSizes?.length ?? 0) > 0
    const isSizeRequired = hasSizes && !selections.size

    if (!product?.toppingCategories) {
      return { isValid: !isSizeRequired, isSizeRequired, unsatisfiedGroups, unsatisfiedGroupIds }
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
      isValid: !isSizeRequired && unsatisfiedGroups.length === 0,
      isSizeRequired,
      unsatisfiedGroups,
      unsatisfiedGroupIds,
    }
  }, [product, selections])
}
