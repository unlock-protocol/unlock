import { Disclosure, Placeholder } from '@unlock-protocol/ui'
import { ReactNode } from 'react'

interface SettingCardProps {
  label: string
  description?: ReactNode
  children?: ReactNode
  isLoading?: boolean
  disabled?: boolean
}

interface SettingCardDetailProps {
  title: string
  description: ReactNode
}

export const SettingCardDetail = ({
  title,
  description,
}: SettingCardDetailProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-base font-bold text-gray-700">{title}</span>
      <div className="text-sm text-gray-700">{description}</div>
    </div>
  )
}

export const SettingCard = ({
  label,
  description,
  children,
  isLoading,
  disabled,
}: SettingCardProps) => {
  if (isLoading) {
    return <Placeholder.Card size="md" />
  }

  return (
    <Disclosure
      label={label}
      description={description}
      disabled={disabled}
      isLoading={isLoading}
    >
      {children}
    </Disclosure>
  )
}
