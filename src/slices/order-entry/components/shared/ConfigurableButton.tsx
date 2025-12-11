// ConfigurableButton - Button that loads styling from UIControls database

import { useUIControl } from '../../shared/hooks/useUIControl'
import type { ReactNode } from 'react'

interface ConfigurableButtonProps {
  configName: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export function ConfigurableButton({
  configName,
  onClick,
  disabled = false,
  className = '',
  children,
}: ConfigurableButtonProps) {
  const { data: config } = useUIControl(configName)

  // Build inline styles from DB config
  const style: React.CSSProperties = {}
  if (config?.backColor) {
    style.backgroundColor = config.backColor
    style.borderColor = config.backColor
  }
  if (config?.foreColor) {
    style.color = config.foreColor
  }
  if (config?.fontSize) {
    style.fontSize = `${config.fontSize}px`
  }

  // Determine button text: use displayName from config, or children, or configName as fallback
  const buttonText = children ?? config?.displayName ?? configName

  return (
    <button
      className={`btn btn-sm flex-1 ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonText}
    </button>
  )
}
