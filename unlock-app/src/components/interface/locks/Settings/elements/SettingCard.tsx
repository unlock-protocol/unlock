import { Disclosure } from '@headlessui/react'
import { ReactNode } from 'react'
import { FiChevronUp as ArrowUpIcon } from 'react-icons/fi'

interface SettingCardProps {
  label: string
  description?: string
  children?: ReactNode
  isLoading?: boolean
}

export const SettingCardPlaceholder = () => {
  return (
    <div className="w-full h-32 p-6 border border-gray-100 bg-slate-200 rounded-2xl animate-pulse"></div>
  )
}

export const SettingCard = ({
  label,
  description,
  children,
  isLoading,
}: SettingCardProps) => {
  if (isLoading) {
    return <SettingCardPlaceholder />
  }

  // TODO: add component and replace also for metadata
  return (
    <Disclosure>
      {({ open }) => (
        <div className="w-full p-6 bg-white border border-gray-100 rounded-2xl">
          <Disclosure.Button className="flex justify-between w-full">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xl font-bold text-brand-ui-primary">
                {label}
              </span>
              {description && (
                <span className="text-base text-brand-dark">{description}</span>
              )}
            </div>
            <ArrowUpIcon
              className={`transition duration-200 ease-in-out text-brand-ui-primary ${
                open ? 'rotate-180' : ''
              }`}
            />
          </Disclosure.Button>
          {children && (
            <Disclosure.Panel className="pt-10">{children}</Disclosure.Panel>
          )}
        </div>
      )}
    </Disclosure>
  )
}
