// Menu Browse View - Horizontal columns for menu navigation

import { useState, useCallback } from 'react'
import {
  MenuColumn,
  MenuTile,
  CategoryTile,
  ProductTile,
} from '../components/menu'
import { useMenus } from './useMenus'
import { useCategories } from './useCategories'
import {
  useProductsByCategory,
  useProductsByMenu,
  useDirectProducts,
} from './useProducts'
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
  const { data: directProducts = [], isLoading: directProductsLoading } =
    useDirectProducts()
  // Filter out "No Menu" menus
  const visibleMenus = menus.filter((m) => !m.isNoMenu)

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
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {/* Column 1: Menus */}
      <MenuColumn title="Menus" isLoading={menusLoading}>
        {visibleMenus.map((menu) => (
          <MenuTile
            key={menu.id}
            menu={menu}
            isSelected={menu.id === selectedMenuId}
            onClick={() => handleMenuSelect(menu)}
          />
        ))}
      </MenuColumn>

      {/* Column 2: Menu Products (products directly on menu) */}
      {selectedMenuId && menuProducts.length > 0 && (
        <MenuColumn title="Menu Items" isLoading={menuProductsLoading}>
          {menuProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              onClick={() => handleProductSelect(product)}
            />
          ))}
        </MenuColumn>
      )}

      {/* Column 3: Categories */}
      {selectedMenuId && categories.length > 0 && (
        <MenuColumn title="Categories" isLoading={categoriesLoading}>
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              isSelected={category.id === selectedCategoryId}
              onClick={() => handleCategorySelect(category)}
            />
          ))}
        </MenuColumn>
      )}

      {/* Column 4: Category Products */}
      {selectedCategoryId && (
        <MenuColumn title="Products" isLoading={categoryProductsLoading}>
          {categoryProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              onClick={() => handleProductSelect(product)}
            />
          ))}
        </MenuColumn>
      )}

      {/* Column 5: Direct Products (always visible if any exist) */}
      {directProducts.length > 0 && (
        <MenuColumn title="Quick Items" isLoading={directProductsLoading}>
          {directProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              onClick={() => handleProductSelect(product)}
            />
          ))}
        </MenuColumn>
      )}
    </div>
  )
}
