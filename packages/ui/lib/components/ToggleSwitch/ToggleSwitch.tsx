import { Switch as SwitchComponent } from '@headlessui/react'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface ToggleSwitchProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  title?: string
  onChange?: (enabled: boolean) => void
  disabled?: boolean
}

export const ToggleSwitch = ({
  title = '',
  enabled,
  setEnabled,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => {
  const switchClass = twMerge(
    enabled ? 'bg-brand-ui-primary' : 'bg-gray-400',
    'disabled:opacity-50 relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
  )

  const buttonClass = twMerge(
    enabled ? 'translate-x-6' : 'translate-x-0',
    'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-100'
  )

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(enabled)
    }
  }, [enabled])

  return (
    <div className="flex items-center gap-4">
      {title?.length > 0 && (
        <span className="text-sm font-semibold">{title}</span>
      )}
      <SwitchComponent
        checked={enabled}
        onChange={setEnabled}
        className={switchClass}
        disabled={disabled}
      >
        <span aria-hidden="true" className={buttonClass} />
      </SwitchComponent>
    </div>
  )
}
