// Menu Browse View - Horizontal columns for menu navigation
// Optimized with virtualization and prefetching for fast rendering

import {
  MenuColumn,
  MenuTopBar,
  MenuBottomBar,
  VirtualizedTileGrid,
} from './components'
import { useMenuBrowse } from './hooks/useMenuBrowse'
import { usePrefetch } from './hooks/usePrefetch'
import type { Product, Menu, MenuCategory } from '../shared/types'

interface MenuBrowseViewProps {
  onProductSelect: (product: Product) => void | Promise<void>
}

export function MenuBrowseView({ onProductSelect }: MenuBrowseViewProps) {
  const handleProduct = (product: Product) => {
    void onProductSelect(product)
  }

  const {
    selectedMenuId,
    selectedCategoryId,
    visibleMenus,
    categories,
    menuProducts,
    categoryProducts,
    directProducts,
    menusLoading,
    categoriesLoading,
    menuProductsLoading,
    categoryProductsLoading,
    directProductsLoading,
    handleMenuSelect,
    handleCategorySelect,
    handleProductSelect,
  } = useMenuBrowse(handleProduct)

  const { prefetchCategories, prefetchMenuProducts, prefetchCategoryProducts } =
    usePrefetch()

  // Prefetch on hover handlers
  const handleMenuHover = (menu: Menu) => {
    prefetchCategories(menu.id)
    prefetchMenuProducts(menu.id)
  }

  const handleCategoryHover = (category: MenuCategory) => {
    prefetchCategoryProducts(category.id)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Top Bar */}
      <MenuTopBar />

      {/* Main Content */}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-auto p-4 pb-16">
        <div className="flex h-full min-w-full gap-2">
          {visibleMenus.length > 0 && (
            <MenuColumn
              title="Menus"
              configName="Menus"
              isLoading={menusLoading}
            >
              <VirtualizedTileGrid
                items={visibleMenus}
                selectedId={selectedMenuId}
                onItemClick={(item) => handleMenuSelect(item as Menu)}
                onItemHover={(item) => handleMenuHover(item as Menu)}
              />
            </MenuColumn>
          )}

          {menuProducts.length > 0 && (
            <MenuColumn
              title="Menu Items"
              configName="Menu Products"
              isLoading={menuProductsLoading}
            >
              <VirtualizedTileGrid
                items={menuProducts}
                showPrice
                onItemClick={(item) => handleProductSelect(item as Product)}
              />
            </MenuColumn>
          )}

          {directProducts.length > 0 && (
            <MenuColumn
              title="Direct Products"
              configName="Direct Products"
              isLoading={directProductsLoading}
            >
              <VirtualizedTileGrid
                items={directProducts}
                showPrice
                onItemClick={(item) => handleProductSelect(item as Product)}
              />
            </MenuColumn>
          )}

          {categories.length > 0 && (
            <MenuColumn
              title="Menu Groups"
              configName="Menu Groups"
              isLoading={categoriesLoading}
            >
              <VirtualizedTileGrid
                items={categories}
                selectedId={selectedCategoryId}
                onItemClick={(item) =>
                  handleCategorySelect(item as MenuCategory)
                }
                onItemHover={(item) =>
                  handleCategoryHover(item as MenuCategory)
                }
              />
            </MenuColumn>
          )}

          {categoryProducts.length > 0 && (
            <MenuColumn
              title="Products"
              configName="Products"
              isLoading={categoryProductsLoading}
            >
              <VirtualizedTileGrid
                items={categoryProducts}
                showPrice
                onItemClick={(item) => handleProductSelect(item as Product)}
              />
            </MenuColumn>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <MenuBottomBar />
    </div>
  )
}
