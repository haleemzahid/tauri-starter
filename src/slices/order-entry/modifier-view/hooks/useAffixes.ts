// useAffixes - Fetch affixes and manage selection state

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAffixes } from '../../browse-menu/queries/product-queries'
import type { Affix } from '../../shared/types'

export function useAffixes() {
  const [selectedAffix, setSelectedAffix] = useState<Affix | null>(null)

  const { data: affixes = [] } = useQuery({
    queryKey: ['affixes'],
    queryFn: getAffixes,
    staleTime: 10 * 60 * 1000,
  })

  const selectAffix = useCallback((affix: Affix | null) => {
    setSelectedAffix((prev) => (prev?.id === affix?.id ? null : affix))
  }, [])

  const clearAffix = useCallback(() => {
    setSelectedAffix(null)
  }, [])

  return { affixes, selectedAffix, selectAffix, clearAffix }
}
