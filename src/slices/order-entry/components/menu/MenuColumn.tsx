// Menu Column - Single column in the horizontal menu layout

import type { ReactNode } from 'react'

interface MenuColumnProps {
  title: string
  children: ReactNode
  isLoading?: boolean
}

export function MenuColumn({
  title,
  children,
  isLoading = false,
}: MenuColumnProps) {
  return (
    <div className="flex h-full w-[200px] flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-2 px-1">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-sm" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-2">{children}</div>
        )}
      </div>
    </div>
  )
}
