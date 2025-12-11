// Menu Browse View - Horizontal columns for menu navigation

import { MenuColumn, Tile, MenuTopBar, MenuBottomBar } from '../components/menu'
import { useMenuBrowse } from './useMenuBrowse'
import type { Product } from '../shared/types'

interface MenuBrowseViewProps {
  onProductSelect: (product: Product) => void | Promise<void>
}

export function MenuBrowseView({ onProductSelect }: MenuBrowseViewProps) {
  const {
    selectedMenuId,
    selectedCategoryId,
    visibleMenus,
    categories,
    menuProducts,
    categoryProducts,
    menusLoading,
    categoriesLoading,
    menuProductsLoading,
    categoryProductsLoading,
    handleMenuSelect,
    handleCategorySelect,
    handleProductSelect,
  } = useMenuBrowse(onProductSelect)

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
            isLoading={
              categoryProductsLoading ||
              (categoriesLoading && !selectedCategoryId)
            }
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
