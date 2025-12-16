// ModifierView - Main container for product configuration (XState powered)

import { useModifierFlow } from './hooks/useModifierFlow'
import { useAffixes } from './hooks/useAffixes'
import { ModifierHeader } from './ModifierHeader'
import { ModifierTabs } from './ModifierTabs'
import { SizeSelector } from './SizeSelector'
import { TypeSelector } from './TypeSelector'
import { PortionSelector } from './PortionSelector'
import { ModifierGroupSelector } from './ModifierGroupSelector'
import { ToppingGrid } from './ToppingGrid'
import { AffixSelector } from './AffixSelector'

interface ModifierViewProps {
  onConfirm: () => void
  onCancel: () => void
  onDelete: () => void
}

export function ModifierView({
  onConfirm,
  onCancel,
  onDelete,
}: ModifierViewProps) {
  const {
    product,
    item,
    currentTab,
    setCurrentTab,
    activeCategory,
    activePortion,
    activePortionId,
    selectPortion,
    availableTabs,
    unsatisfiedMandatory,
    firstUnsatisfied,
    isCategoryLocked,
    isTabLocked,
    isModifiersTabLocked,
    advanceTab,
    selectCategory,
    goToRequired,
  } = useModifierFlow()

  const { affixes, selectedAffix, selectAffix, clearAffix } = useAffixes()

  if (!product || !item) {
    return (
      <div className="text-base-content/50 flex h-full items-center justify-center">
        No product selected
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ModifierHeader
        onConfirm={onConfirm}
        onCancel={onCancel}
        onDelete={onDelete}
      />

      <ModifierTabs
        availableTabs={availableTabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unsatisfiedCount={unsatisfiedMandatory.length}
        isTabLocked={isTabLocked}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {currentTab === 'sizes' && (
          <SizeSelector onAdvance={() => advanceTab('sizes')} />
        )}
        {currentTab === 'types' && (
          <TypeSelector onAdvance={() => advanceTab('types')} />
        )}
        {currentTab === 'portions' && (
          <PortionSelector onAdvance={() => advanceTab('portions')} />
        )}
        {currentTab === 'modifier-groups' && (
          <ModifierGroupSelector
            activeCategory={activeCategory}
            onSelectCategory={selectCategory}
            isCategoryLocked={isCategoryLocked}
            firstUnsatisfied={firstUnsatisfied}
          />
        )}
        {currentTab === 'modifiers' && (
          <>
            <AffixSelector
              affixes={affixes}
              selectedAffix={selectedAffix}
              onSelect={selectAffix}
            />
            <ToppingGrid
              activeCategory={activeCategory}
              activePortion={activePortion}
              activePortionId={activePortionId}
              isLocked={isModifiersTabLocked}
              lockReason={firstUnsatisfied?.name}
              onGoToRequired={goToRequired}
              selectedAffix={selectedAffix}
              onAffixUsed={clearAffix}
            />
          </>
        )}
      </div>
    </div>
  )
}
