// Menu Browse View - Horizontal columns for menu navigation

import { useState, useCallback, useEffect } from 'react'
import { MenuColumn, Tile, MenuTopBar, MenuBottomBar } from '../components/menu'
import { useMenus } from './useMenus'
import { useCategories } from './useCategories'
import { useProductsByCategory, useProductsByMenu } from './useProducts'
import type { Menu, MenuCategory, Product } from '../shared/types'

interface MenuBrowseViewProps {
  onProductSelect: (product: Product) => void
}

export function MenuBrowseView({ onProductSelect }: MenuBrowseViewProps) {
  // Selection state
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  // Data fetching
  const { data: menus = [], isLoading: menusLoading } = useMenus()
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories(selectedMenuId)
  const { data: menuProducts = [], isLoading: menuProductsLoading } =
    useProductsByMenu(selectedMenuId)
  const { data: categoryProducts = [], isLoading: categoryProductsLoading } =
    useProductsByCategory(selectedCategoryId)
  // Filter out "No Menu" menus
  const visibleMenus = menus.filter((m) => !m.isNoMenu)

  // Auto-select first menu when menus load
  useEffect(() => {
    if (visibleMenus.length > 0 && !selectedMenuId) {
      setSelectedMenuId(visibleMenus[0].id)
    }
  }, [visibleMenus, selectedMenuId])

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  // Handlers
  const handleMenuSelect = useCallback((menu: Menu) => {
    setSelectedMenuId(menu.id)
    setSelectedCategoryId(null)
  }, [])

  const handleCategorySelect = useCallback((category: MenuCategory) => {
    setSelectedCategoryId(category.id)
  }, [])

  const handleProductSelect = useCallback(
    (product: Product) => {
      onProductSelect(product)
    },
    [onProductSelect]
  )

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Top Bar */}
      <MenuTopBar />

      {/* Main Content */}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-auto p-4 pb-16">
        <div className="flex h-full min-w-full gap-2">
          <MenuColumn title="Menus" configName="Menus" isLoading={menusLoading}>
            {visibleMenus.map((menu) => (
              <Tile
                key={menu.id}
                item={menu}
                isSelected={menu.id === selectedMenuId}
                onClick={() => handleMenuSelect(menu)}
              />
            ))}
          </MenuColumn>

          {/* Column 2: Menu Products (products directly on menu) */}
          <MenuColumn
            title="Menu Items"
            configName="Menu Products"
            isLoading={menuProductsLoading}
          >
            {menuProducts.map((product) => (
              <Tile
                key={product.id}
                item={product}
                showPrice
                onClick={() => handleProductSelect(product)}
              />
            ))}
          </MenuColumn>

          {/* Column 3: Categories (Menu Groups) */}
          <MenuColumn
            title="Menu Groups"
            configName="Menu Groups"
            isLoading={categoriesLoading}
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <Tile
                  key={category.id}
                  item={category}
                  isSelected={category.id === selectedCategoryId}
                  onClick={() => handleCategorySelect(category)}
                />
              ))
            ) : (
              <div className="text-base-content/50 py-4 text-center text-sm">
                No menu groups
              </div>
            )}
          </MenuColumn>

          {/* Column 4: Category Products */}
          <MenuColumn
            title="Products"
            configName="Products"
            isLoading={categoryProductsLoading}
          >
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <Tile
                  key={product.id}
                  item={product}
                  showPrice
                  onClick={() => handleProductSelect(product)}
                />
              ))
            ) : (
              <div className="text-base-content/50 py-4 text-center text-sm">
                No products
              </div>
            )}
          </MenuColumn>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <MenuBottomBar />
    </div>
  )
}
