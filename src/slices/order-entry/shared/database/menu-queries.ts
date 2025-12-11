// Menu Database Queries

import { getDatabase } from '@/core/database/client'
import type { Menu, MenuCategory, Product } from '../types'

/**
 * Get all active menus ordered by OrderNumber
 */
export async function getMenus(): Promise<Menu[]> {
  const db = await getDatabase()
  return db.select<Menu[]>(`
    SELECT 
      Id as id,
      Name as name,
      DisplayName as displayName,
      BackColor as backColor,
      ForeColor as foreColor,
      OrderNumber as orderNumber,
      IsNoMenu as isNoMenu
    FROM Menus 
    ORDER BY OrderNumber
  `)
}

/**
 * Get categories for a specific menu
 */
export async function getCategoriesByMenuId(
  menuId: string
): Promise<MenuCategory[]> {
  const db = await getDatabase()
  return db.select<MenuCategory[]>(
    `
    SELECT 
      Id as id,
      MenuId as menuId,
      Name as name,
      DisplayName as displayName,
      BackColor as backColor,
      ForeColor as foreColor,
      OrderNumber as orderNumber,
      IsActive as isActive
    FROM MenuCategories 
    WHERE MenuId = $1 AND IsActive = 1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `,
    [menuId]
  )
}

/**
 * Get products for a specific category
 */
export async function getProductsByCategoryId(
  categoryId: string
): Promise<Product[]> {
  const db = await getDatabase()
  return db.select<Product[]>(
    `
    SELECT 
      Id as id,
      MenuCatGuid as menuCategoryId,
      Name as name,
      DisplayName as displayName,
      BackColor as backColor,
      ForeColor as foreColor,
      BasePrice as basePrice,
      IsTaxed as isTaxed,
      TaxGroupId as taxGroupId,
      OrderNumber as orderNumber,
      IsActive as isActive,
      AllowedSpecialRequest as allowSpecialRequest
    FROM Products 
    WHERE MenuCatGuid = $1 AND IsActive = 1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `,
    [categoryId]
  )
}

/**
 * Get products directly assigned to a menu (MenuProducts)
 */
export async function getProductsByMenuId(menuId: string): Promise<Product[]> {
  const db = await getDatabase()
  return db.select<Product[]>(
    `
    SELECT 
      p.Id as id,
      p.MenuGuid as menuId,
      p.Name as name,
      p.DisplayName as displayName,
      p.BackColor as backColor,
      p.ForeColor as foreColor,
      p.BasePrice as basePrice,
      p.IsTaxed as isTaxed,
      p.TaxGroupId as taxGroupId,
      p.OrderNumber as orderNumber,
      p.IsActive as isActive,
      p.AllowedSpecialRequest as allowSpecialRequest
    FROM Products p
    WHERE p.MenuGuid = $1 AND p.IsActive = 1 AND p.IsDeleted = 0
    ORDER BY p.OrderNumber
  `,
    [menuId]
  )
}

/**
 * Get direct products (not assigned to any category or menu)
 */
export async function getDirectProducts(): Promise<Product[]> {
  const db = await getDatabase()
  return db.select<Product[]>(`
    SELECT 
      Id as id,
      Name as name,
      DisplayName as displayName,
      BackColor as backColor,
      ForeColor as foreColor,
      BasePrice as basePrice,
      IsTaxed as isTaxed,
      TaxGroupId as taxGroupId,
      OrderNumber as orderNumber,
      IsActive as isActive,
      AllowedSpecialRequest as allowSpecialRequest
    FROM Products 
    WHERE (MenuCatGuid IS NULL OR MenuCatGuid = '') 
      AND (MenuGuid IS NULL OR MenuGuid = '')
      AND IsActive = 1 AND IsDeleted = 0
    ORDER BY OrderNumber
  `)
}
