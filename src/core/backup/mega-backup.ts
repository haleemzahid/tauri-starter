import { Storage, MutableFile } from 'megajs'
import { readFile } from '@tauri-apps/plugin-fs'
import { appDataDir, join } from '@tauri-apps/api/path'

let storage: Storage | null = null
let backupInterval: ReturnType<typeof setInterval> | null = null
let isBackingUp = false

interface BackupConfig {
  email: string
  password: string
  intervalMinutes?: number
}

/**
 * Initialize MEGA storage connection
 */
async function initMegaStorage(email: string, password: string): Promise<Storage> {
  return new Promise((resolve, reject) => {
    const megaStorage = new Storage({
      email,
      password,
    })

    megaStorage.once('ready', () => {
      console.log('[Backup] MEGA storage connected')
      resolve(megaStorage)
    })

    // @ts-expect-error - megajs types are incomplete
    megaStorage.on('error', (err: Error) => {
      console.error('[Backup] MEGA connection error:', err)
      reject(err)
    })
  })
}

/**
 * Upload the database file to MEGA
 */
async function uploadDatabase(): Promise<boolean> {
  if (!storage || isBackingUp) {
    return false
  }

  isBackingUp = true

  try {
    // Get the app data directory and database path
    const appData = await appDataDir()
    const dbPath = await join(appData, 'app.db')

    // Read the database file
    const fileData = await readFile(dbPath)

    // Create filename with timestamp
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${timestamp}.db`

    // Find or create backup folder
    let backupFolder = storage.root.children?.find(
      (child) => child.name === 'SalesAppBackups'
    ) as MutableFile | undefined

    if (!backupFolder) {
      // Create the backup folder
      backupFolder = await storage.mkdir('SalesAppBackups')
    }

    if (!backupFolder) {
      console.error('[Backup] Failed to create backup folder')
      return false
    }

    // Upload the file
    await new Promise<void>((resolve, reject) => {
      const uploadStream = backupFolder!.upload({
        name: filename,
        size: fileData.length,
      })

      uploadStream.on('complete', () => {
        console.log(`[Backup] Successfully uploaded: ${filename}`)
        resolve()
      })

      uploadStream.on('error', (err: Error) => {
        console.error('[Backup] Upload error:', err)
        reject(err)
      })

      // Write the file data
      uploadStream.end(new Uint8Array(fileData))
    })

    // Clean up old backups (keep last 10)
    await cleanupOldBackups(backupFolder)

    return true
  } catch (error) {
    // Silently fail if no internet or other issues
    console.warn('[Backup] Backup failed (possibly no internet):', error)
    return false
  } finally {
    isBackingUp = false
  }
}

/**
 * Keep only the last N backups
 */
async function cleanupOldBackups(folder: MutableFile, keepCount = 10) {
  try {
    const backups = folder.children
      ?.filter((child) => child.name?.startsWith('backup_') && child.name?.endsWith('.db'))
      .sort((a, b) => (b.name || '').localeCompare(a.name || ''))

    if (backups && backups.length > keepCount) {
      const toDelete = backups.slice(keepCount)
      for (const file of toDelete) {
        try {
          await file.delete(true)
        } catch (err) {
          console.warn('[Backup] Failed to delete old backup:', err)
        }
      }
      console.log(`[Backup] Cleaned up ${toDelete.length} old backups`)
    }
  } catch (error) {
    console.warn('[Backup] Cleanup failed:', error)
  }
}

/**
 * Start automatic backup service
 */
export async function startBackupService(config: BackupConfig): Promise<boolean> {
  try {
    // Stop any existing backup service
    stopBackupService()

    // Initialize MEGA storage
    storage = await initMegaStorage(config.email, config.password)

    // Set up interval (default 15 minutes)
    const intervalMs = (config.intervalMinutes || 15) * 60 * 1000

    // Do initial backup
    await uploadDatabase()

    // Start interval
    backupInterval = setInterval(() => {
      void uploadDatabase()
    }, intervalMs)

    console.log(`[Backup] Service started (every ${config.intervalMinutes || 15} minutes)`)
    return true
  } catch (error) {
    console.error('[Backup] Failed to start backup service:', error)
    return false
  }
}

/**
 * Stop the backup service
 */
export function stopBackupService() {
  if (backupInterval) {
    clearInterval(backupInterval)
    backupInterval = null
  }
  storage = null
  console.log('[Backup] Service stopped')
}

/**
 * Trigger a manual backup
 */
export async function triggerManualBackup(): Promise<boolean> {
  if (!storage) {
    console.warn('[Backup] Service not started')
    return false
  }
  return uploadDatabase()
}

/**
 * Check if backup service is running
 */
export function isBackupServiceRunning(): boolean {
  return storage !== null && backupInterval !== null
}
