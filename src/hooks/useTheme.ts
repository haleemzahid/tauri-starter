import { useEffect, useState } from 'react'

export const AVAILABLE_THEMES = ['light', 'dark'] as const

export type Theme = (typeof AVAILABLE_THEMES)[number]

const THEME_STORAGE_KEY = 'app-theme'
const DEFAULT_THEME: Theme = 'dark'

/**
 * Custom hook for managing application theme
 *
 * Features:
 * - Applies theme to HTML data-theme attribute
 * - Persists theme selection to localStorage
 * - Loads saved theme on mount
 * - Type-safe theme values
 *
 * @returns {object} - { theme, setTheme, availableThemes }
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && AVAILABLE_THEMES.includes(savedTheme as Theme)) {
        return savedTheme as Theme
      }
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    // Apply theme to HTML element
    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    if (AVAILABLE_THEMES.includes(newTheme)) {
      setThemeState(newTheme)
    } else {
      console.warn(`Invalid theme: ${newTheme}. Using default theme.`)
      setThemeState(DEFAULT_THEME)
    }
  }

  return {
    theme,
    setTheme,
    availableThemes: AVAILABLE_THEMES,
  }
}
