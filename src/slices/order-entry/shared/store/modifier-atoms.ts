// Modifier Selection State Atoms

import { atom, useAtomValue, useSetAtom } from 'jotai'
import type {
  AssignedSize,
  ProductType,
  PortionType,
  ToppingCategory,
  Topping,
  Affix,
} from '../types'

// === Selection State ===

export interface SelectedModifier {
  id: string // unique id for this selection
  toppingId: string
  topping: Topping
  affix?: Affix
  quantity: number
}

export interface ModifierSelections {
  sizeId: string | null
  size: AssignedSize | null
  typeId: string | null
  type: ProductType | null
  portionIds: string[]
  portions: PortionType[]
  // Map of toppingCategoryId -> selected modifiers
  modifiersByCategory: Map<string, SelectedModifier[]>
  quantity: number
}

const initialSelections: ModifierSelections = {
  sizeId: null,
  size: null,
  typeId: null,
  type: null,
  portionIds: [],
  portions: [],
  modifiersByCategory: new Map(),
  quantity: 1,
}

export const modifierSelectionsAtom =
  atom<ModifierSelections>(initialSelections)

// Current topping category being viewed (for Modifiers tab)
export const activeToppingCategoryAtom = atom<ToppingCategory | null>(null)

// === Actions ===

export const resetModifierSelectionsAtom = atom(null, (_get, set) => {
  set(modifierSelectionsAtom, {
    ...initialSelections,
    modifiersByCategory: new Map(),
  })
  set(activeToppingCategoryAtom, null)
})

export const setSelectedSizeAtom = atom(
  null,
  (_get, set, size: AssignedSize | null) => {
    set(modifierSelectionsAtom, (prev) => ({
      ...prev,
      sizeId: size?.id ?? null,
      size,
    }))
  }
)

export const setSelectedTypeAtom = atom(
  null,
  (_get, set, type: ProductType | null) => {
    set(modifierSelectionsAtom, (prev) => ({
      ...prev,
      typeId: type?.id ?? null,
      type,
    }))
  }
)

export const togglePortionAtom = atom(
  null,
  (_get, set, portion: PortionType) => {
    set(modifierSelectionsAtom, (prev) => {
      const isSelected = prev.portionIds.includes(portion.id)
      if (isSelected) {
        return {
          ...prev,
          portionIds: prev.portionIds.filter((id) => id !== portion.id),
          portions: prev.portions.filter((p) => p.id !== portion.id),
        }
      } else {
        return {
          ...prev,
          portionIds: [...prev.portionIds, portion.id],
          portions: [...prev.portions, portion],
        }
      }
    })
  }
)

export const toggleModifierAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      category: ToppingCategory
      topping: Topping
      affix?: Affix
    }
  ) => {
    const { category, topping, affix } = payload
    set(modifierSelectionsAtom, (prev) => {
      const categoryMods = prev.modifiersByCategory.get(category.id) ?? []
      const existingIndex = categoryMods.findIndex(
        (m) => m.toppingId === topping.id
      )

      const newMap = new Map(prev.modifiersByCategory)

      if (existingIndex >= 0) {
        // Deselect - remove it
        const filtered = categoryMods.filter((_, i) => i !== existingIndex)
        if (filtered.length === 0) {
          newMap.delete(category.id)
        } else {
          newMap.set(category.id, filtered)
        }
      } else {
        // Select - add it
        const newModifier: SelectedModifier = {
          id: crypto.randomUUID(),
          toppingId: topping.id,
          topping,
          affix,
          quantity: 1,
        }

        if (category.canAddMultiple) {
          // Multi-select: add to list
          newMap.set(category.id, [...categoryMods, newModifier])
        } else {
          // Single-select: replace
          newMap.set(category.id, [newModifier])
        }
      }

      return { ...prev, modifiersByCategory: newMap }
    })
  }
)

export const setQuantityAtom = atom(null, (_get, set, quantity: number) => {
  set(modifierSelectionsAtom, (prev) => ({
    ...prev,
    quantity: Math.max(1, quantity),
  }))
})

// === Hooks ===

export const useModifierSelections = () => useAtomValue(modifierSelectionsAtom)
export const useActiveToppingCategory = () =>
  useAtomValue(activeToppingCategoryAtom)
export const useSetActiveToppingCategory = () =>
  useSetAtom(activeToppingCategoryAtom)

export const useResetModifierSelections = () =>
  useSetAtom(resetModifierSelectionsAtom)
export const useSetSelectedSize = () => useSetAtom(setSelectedSizeAtom)
export const useSetSelectedType = () => useSetAtom(setSelectedTypeAtom)
export const useTogglePortion = () => useSetAtom(togglePortionAtom)
export const useToggleModifier = () => useSetAtom(toggleModifierAtom)
export const useSetQuantity = () => useSetAtom(setQuantityAtom)
