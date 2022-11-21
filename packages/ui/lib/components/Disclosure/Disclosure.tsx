import { ReactNode } from 'react'
import { FiChevronUp as ArrowUpIcon } from 'react-icons/fi'
import { Disclosure as DisclosureComponent } from '@headlessui/react'

interface DisclosureProps {
  label: string
  description?: ReactNode
  children?: ReactNode
  isLoading?: boolean
  disabled?: boolean
}

export const DisclosurePlaceholder = () => {
  return (
    <div className="w-full h-32 p-6 border border-gray-100 bg-slate-200 rounded-2xl animate-pulse"></div>
  )
}

export const Disclosure = ({
  label,
  description,
  children,
  isLoading,
  disabled,
}: DisclosureProps) => {
  if (isLoading) {
    return <DisclosurePlaceholder />
  }

  return (
    <DisclosureComponent>
      {({ open }) => (
        <div className="w-full p-6 bg-white border border-gray-100 rounded-2xl">
          <DisclosureComponent.Button
            className="flex flex-col w-full gap-2 outline-none"
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
          </DisclosureComponent.Button>
          {children && (
            <DisclosureComponent.Panel className="pt-10">
              {children}
            </DisclosureComponent.Panel>
          )}
        </div>
      )}
    </DisclosureComponent>
  )
}
