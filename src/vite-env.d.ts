/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_API_URL?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_MEGA_EMAIL?: string
  readonly VITE_MEGA_PASSWORD?: string
  readonly VITE_MEGA_BACKUP_INTERVAL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
