import { Disclosure } from '@unlock-protocol/ui'
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
  description: string
}

export const SettingCardPlaceholder = () => {
  return (
    <div className="w-full h-32 p-6 border border-gray-100 bg-slate-200 rounded-2xl animate-pulse"></div>
  )
}

export const SettingCardDetail = ({
  title,
  description,
}: SettingCardDetailProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-base font-bold text-gray-700">{title}</span>
      <span className="text-sm text-gray-700">{description}</span>
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
    return <SettingCardPlaceholder />
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
