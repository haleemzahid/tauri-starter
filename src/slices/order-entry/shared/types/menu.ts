// Menu & Product Types

export interface Menu {
  id: string
  name: string
  displayName?: string
  backColor: string
  foreColor: string
  orderNumber: number
  isNoMenu: boolean
}

export interface MenuCategory {
  id: string
  menuId: string
  name: string
  displayName?: string
  backColor: string
  foreColor: string
  orderNumber: number
  isActive: boolean
}

export interface Product {
  id: string
  menuCategoryId?: string
  menuId?: string
  name: string
  displayName?: string
  backColor: string
  foreColor: string
  basePrice: number
  isTaxed: boolean
  taxGroupId?: string
  orderNumber: number
  isActive: boolean
  allowSpecialRequest: boolean
  // Loaded relations
  assignedSizes?: AssignedSize[]
  productTypes?: ProductType[]
  portionTypes?: PortionType[]
  toppingCategories?: ToppingCategory[]
}

export interface Size {
  id: string
  name: string
  displayName?: string
  orderNumber: number
}

export interface AssignedSize {
  id: string
  productId: string
  sizeId: string
  price: number
  isAssigned: boolean
  orderNumber: number
  size?: Size
}

export interface ProductType {
  id: string
  productId: string
  name: string
  displayName?: string
  price: number
  orderNumber: number
}

export interface PortionType {
  id: string
  productId: string
  name: string
  displayName?: string
  price: number
  orderNumber: number
}

export interface ToppingCategory {
  id: string
  productId: string
  name: string
  displayName?: string
  isMandatory: boolean
  canAddMultiple: boolean
  orderNumber: number
  isActive: boolean
  toppings?: Topping[]
}

export interface Topping {
  id: string
  toppingCategoryId: string
  name: string
  displayName?: string
  price: number
  backColor?: string
  foreColor?: string
  orderNumber: number
  isActive: boolean
}

export interface Affix {
  id: string
  name: string
  displayName?: string
  isPrefix: boolean
  priceModifier: number // e.g., 0 for "No", 1.5 for "Extra"
  orderNumber: number
}
