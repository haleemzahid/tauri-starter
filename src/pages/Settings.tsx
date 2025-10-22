import { useState } from 'react'
import { Palette, Bell, User, AlertTriangle } from 'lucide-react'
import { useTheme, AVAILABLE_THEMES, type Theme } from '../hooks/useTheme'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(false)

  const handleThemeChange = (value: string) => {
    if (AVAILABLE_THEMES.includes(value as Theme)) {
      setTheme(value as Theme)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-base-content">Settings</h1>
        <p className="text-base-content/70 mt-2">
          Manage your application preferences and configuration
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <Palette className="w-6 h-6 text-primary" />
            Appearance
          </h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Theme</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {AVAILABLE_THEMES.map((themeName) => (
                <option key={themeName} value={themeName}>
                  {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt">
                Choose your preferred color theme
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <Bell className="w-6 h-6 text-secondary" />
            Notifications
          </h2>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <div>
                <span className="label-text font-semibold block">
                  Enable Notifications
                </span>
                <span className="label-text-alt block">
                  Receive alerts and updates from the application
                </span>
              </div>
            </label>
          </div>

          <div className="divider"></div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-secondary"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              <div>
                <span className="label-text font-semibold block">
                  Auto-save Changes
                </span>
                <span className="label-text-alt block">
                  Automatically save your work every few minutes
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <User className="w-6 h-6 text-accent" />
            Account
          </h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="input input-bordered w-full max-w-xs"
              defaultValue="user@example.com"
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="input input-bordered w-full max-w-xs"
              defaultValue="user@example.com"
            />
          </div>

          <div className="card-actions justify-end mt-6">
            <button className="btn btn-ghost">Cancel</button>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-error/10 border-2 border-error shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 text-error">
            <AlertTriangle className="w-6 h-6" />
            Danger Zone
          </h2>

          <p className="text-base-content/70 mb-4">
            Irreversible actions that will permanently affect your account and
            data
          </p>

          <div className="flex gap-2">
            <button className="btn btn-outline btn-error">
              Reset Settings
            </button>
            <button className="btn btn-error">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
