import { Disclosure } from '@headlessui/react'
import { ReactNode } from 'react'
import { FiChevronUp as ArrowUpIcon } from 'react-icons/fi'

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

  // TODO: add component and replace also for metadata
  return (
    <Disclosure>
      {({ open }) => (
        <div className="w-full p-6 bg-white border border-gray-100 rounded-2xl">
          <Disclosure.Button
            className="flex flex-col w-full gap-2"
            disabled={disabled}
          >
            <div className="flex justify-between w-full">
              <span className="text-xl font-bold text-brand-ui-primary">
                {label}
              </span>
              <ArrowUpIcon
                className={`transition duration-200 ease-in-out text-brand-ui-primary ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </div>
            {description && (
              <div className="w-full text-left">
                <span className="text-base text-brand-dark">{description}</span>
              </div>
            )}
          </Disclosure.Button>
          {children && (
            <Disclosure.Panel className="pt-10">{children}</Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  )
}
