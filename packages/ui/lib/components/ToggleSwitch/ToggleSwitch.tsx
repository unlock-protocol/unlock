import { ReactNode, useEffect } from 'react'
import { Size } from '~/types'
import { FieldLayout } from '../Form'
import { Toggle } from '../Toggle/Toggle'

interface ToggleSwitchProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  title?: string
  description?: ReactNode
  onChange?: (enabled: boolean) => void
  disabled?: boolean
  size?: Size
}

export const ToggleSwitch = ({
  title = '',
  description = '',
  enabled,
  setEnabled,
  onChange,
  disabled = false,
  size = 'medium',
}: ToggleSwitchProps) => {
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(enabled)
    }
  }, [enabled])

  return (
    <FieldLayout description={description} size={size}>
      <div className="flex items-center gap-4">
        {title?.length > 0 && (
          <span className="text-base semibold">{title}</span>
        )}
        <Toggle
          disabled={disabled}
          onChange={setEnabled}
          value={enabled}
          size={size as Extract<Size, 'small' | 'medium'>}
        />
      </div>
    </FieldLayout>
  )
}
