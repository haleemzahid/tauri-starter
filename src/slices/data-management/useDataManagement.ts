import { useCallback, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { save, open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import { exportAllData, importAllData, validateImportData } from './shared/database'
import type { ExportData } from './shared/types'

interface UseDataManagementResult {
  isExporting: boolean
  isImporting: boolean
  isPending: boolean
  error: string | null
  exportToFile: () => Promise<boolean>
  importFromFile: () => Promise<boolean>
  clearError: () => void
}

export function useDataManagement(): UseDataManagementResult {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const exportToFile = useCallback(async (): Promise<boolean> => {
    setError(null)
    setIsExporting(true)

    try {
      // Get export data
      const data = await exportAllData()

      // Show save dialog
      const filePath = await save({
        title: 'Export Database',
        defaultPath: `sales_backup_${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (!filePath) {
        setIsExporting(false)
        return false // User cancelled
      }

      // Write to file
      const jsonContent = JSON.stringify(data, null, 2)
      await writeTextFile(filePath, jsonContent)

      setIsExporting(false)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
      setIsExporting(false)
      return false
    }
  }, [])

  const importFromFile = useCallback(async (): Promise<boolean> => {
    setError(null)
    setIsImporting(true)

    try {
      // Show open dialog
      const filePath = await open({
        title: 'Import Database',
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (!filePath) {
        setIsImporting(false)
        return false // User cancelled
      }

      // Read file content
      const fileContent = await readTextFile(filePath as string)

      // Parse and validate JSON
      let data: unknown
      try {
        data = JSON.parse(fileContent)
      } catch {
        throw new Error('Invalid JSON file')
      }

      if (!validateImportData(data)) {
        throw new Error('Invalid backup file format. Please select a valid export file.')
      }

      // Confirm import
      const confirmed = confirm(
        'This will replace ALL existing data with the imported data. This action cannot be undone.\n\nAre you sure you want to continue?'
      )

      if (!confirmed) {
        setIsImporting(false)
        return false
      }

      // Perform import
      await importAllData(data as ExportData)

      // Invalidate all queries to refresh the UI
      startTransition(() => {
        void queryClient.invalidateQueries()
      })

      setIsImporting(false)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
      setIsImporting(false)
      return false
    }
  }, [queryClient])

  return {
    isExporting,
    isImporting,
    isPending: isPending || isExporting || isImporting,
    error,
    exportToFile,
    importFromFile,
    clearError,
  }
}
