import { Download, Upload, AlertCircle, CheckCircle2, Database, HardDrive, FileJson } from 'lucide-react'
import { useDataManagement } from './useDataManagement'

export default function SettingsPage() {
  const {
    isExporting,
    isImporting,
    isPending,
    error,
    exportToFile,
    importFromFile,
    clearError,
  } = useDataManagement()

  const handleExport = async () => {
    const success = await exportToFile()
    if (success) {
      alert('Data exported successfully!')
    }
  }

  const handleImport = async () => {
    const success = await importFromFile()
    if (success) {
      alert('Data imported successfully! The application will now refresh.')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-base-content/60">Manage your application data and preferences</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {/* Data Management Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="card-title">Data Management</h2>
              <p className="text-sm text-base-content/60">
                Export and import your database
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Export Card */}
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Download className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Export Data</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      Create a backup of all your data including companies, distributors, sales, and targets.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <FileJson className="h-4 w-4" />
                    <span>Exports as JSON file</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <HardDrive className="h-4 w-4" />
                    <span>Save anywhere on your computer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Includes all tables and relationships</span>
                  </div>
                </div>

                <div className="card-actions mt-4">
                  <button
                    className="btn btn-success w-full"
                    onClick={() => void handleExport()}
                    disabled={isPending}
                  >
                    {isExporting ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export to JSON
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Import Card */}
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Upload className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Import Data</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      Restore your data from a previously exported JSON backup file.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <FileJson className="h-4 w-4" />
                    <span>Accepts JSON backup files</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span>Replaces all existing data</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Validates file before import</span>
                  </div>
                </div>

                <div className="card-actions mt-4">
                  <button
                    className="btn btn-warning w-full"
                    onClick={() => void handleImport()}
                    disabled={isPending}
                  >
                    {isImporting ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import from JSON
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="alert mt-4">
            <Database className="h-5 w-5" />
            <div>
              <h4 className="font-semibold">About Data Backup</h4>
              <p className="text-sm">
                Regular backups help protect your data. Export your data periodically and store the backup files in a safe location.
                You can use these backups to restore your data or transfer it to another device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
