// Product Detail Queries (Sizes, Types, Portions, Toppings)

import { getDatabase } from '@/core/database/client'
import type {
  AssignedSize,
  ProductType,
  PortionType,
  ToppingCategory,
  Topping,
  Affix,
} from '../types'

/**
 * Get assigned sizes for a product
 */
export async function getAssignedSizesByProductId(
  productId: string
): Promise<AssignedSize[]> {
  const db = await getDatabase()
  return db.select<AssignedSize[]>(
    `
    SELECT 
      a.Id as id,
      a.ProductId as productId,
      a.SizeId as sizeId,
      a.Price as price,
      a.IsAssigned as isAssigned,
      a.OrderNumber as orderNumber,
      s.Id as 'size.id',
      s.Name as 'size.name',
      s.DisplayName as 'size.displayName',
      s.OrderNumber as 'size.orderNumber'
    FROM AssignedSizes a
    LEFT JOIN Sizes s ON a.SizeId = s.Id
    WHERE a.ProductId = $1 AND a.IsAssigned = 1
    ORDER BY s.OrderNumber, a.OrderNumber
  `,
    [productId]
  )
}

/**
 * Get product types for a product
 */
export async function getProductTypesByProductId(
  productId: string
): Promise<ProductType[]> {
  const db = await getDatabase()
  return db.select<ProductType[]>(
    `
    SELECT 
      Id as id,
      ProductId as productId,
      Name as name,
      DisplayName as displayName,
      Price as price,
      OrderNumber as orderNumber
    FROM ProductTypes 
    WHERE ProductId = $1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `,
    [productId]
  )
}

/**
 * Get portion types for a product
 */
export async function getPortionTypesByProductId(
  productId: string
): Promise<PortionType[]> {
  const db = await getDatabase()
  return db.select<PortionType[]>(
    `
    SELECT 
      Id as id,
      ProductId as productId,
      Name as name,
      DisplayName as displayName,
      Price as price,
      OrderNumber as orderNumber
    FROM PortionTypes 
    WHERE ProductId = $1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `,
    [productId]
  )
}

/**
 * Get topping categories for a product
 */
export async function getToppingCategoriesByProductId(
  productId: string
): Promise<ToppingCategory[]> {
  const db = await getDatabase()
  return db.select<ToppingCategory[]>(
    `
    SELECT 
      Id as id,
      ProductId as productId,
      Name as name,
      DisplayName as displayName,
      IsMandatory as isMandatory,
      CanAddMultiple as canAddMultiple,
      OrderNumber as orderNumber,
      IsActive as isActive
    FROM ToppingCategories 
    WHERE ProductId = $1 AND IsActive = 1 AND IsDeleted = 0
    ORDER BY IsMandatory DESC, OrderNumber
  `,
    [productId]
  )
}

/**
 * Get toppings for a topping category
 */
export async function getToppingsByCategoryId(
  toppingCategoryId: string
): Promise<Topping[]> {
  const db = await getDatabase()
  return db.select<Topping[]>(
    `
    SELECT 
      Id as id,
      ToppingCatGuid as toppingCategoryId,
      Name as name,
      DisplayName as displayName,
      Price as price,
      BackColor as backColor,
      ForeColor as foreColor,
      OrderNumber as orderNumber,
      IsActive as isActive
    FROM Toppings 
    WHERE ToppingCatGuid = $1 AND IsActive = 1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `,
    [toppingCategoryId]
  )
}

/**
 * Get all toppings for a product (via topping categories)
 */
export async function getToppingsByProductId(
  productId: string
): Promise<ToppingCategory[]> {
  // Get categories first
  const categories = await getToppingCategoriesByProductId(productId)

  // Load toppings for each category
  const categoriesWithToppings = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      toppings: await getToppingsByCategoryId(category.id),
    }))
  )

  return categoriesWithToppings
}

/**
 * Get all affixes
 */
export async function getAffixes(): Promise<Affix[]> {
  const db = await getDatabase()
  return db.select<Affix[]>(`
    SELECT 
      Id as id,
      Name as name,
      DisplayName as displayName,
      IsPrefix as isPrefix,
      PriceModifier as priceModifier,
      OrderNumber as orderNumber
    FROM Affixes 
    WHERE IsDeleted = 0
    ORDER BY OrderNumber
  `)
}

/**
 * Load full product details (sizes, types, portions, toppings)
 */
export async function getProductWithDetails(productId: string) {
  const [assignedSizes, productTypes, portionTypes, toppingCategories] =
    await Promise.all([
      getAssignedSizesByProductId(productId),
      getProductTypesByProductId(productId),
      getPortionTypesByProductId(productId),
      getToppingsByProductId(productId),
    ])

  return {
    assignedSizes,
    productTypes,
    portionTypes,
    toppingCategories,
  }
}
