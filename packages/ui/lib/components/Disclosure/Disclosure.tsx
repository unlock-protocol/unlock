import { ReactNode } from 'react'
import { FiChevronDown as ArrowDownIcon } from 'react-icons/fi'
import { Disclosure as HeadlessDisclosure } from '@headlessui/react'

interface DisclosureProps {
  label: string
  description?: ReactNode
  children?: ReactNode
  isLoading?: boolean
  disabled?: boolean
  defaultOpen?: boolean
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
  defaultOpen,
}: DisclosureProps) => {
  if (isLoading) {
    return <DisclosurePlaceholder />
  }

  return (
    <HeadlessDisclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="w-full p-6 bg-white border border-gray-200 rounded-2xl">
          <HeadlessDisclosure.Button
            className="flex flex-col w-full gap-2 outline-none"
            disabled={disabled}
          >
            <div className="flex justify-between w-full">
              <span className="text-xl font-bold text-brand-ui-primary">
                {label}
              </span>
              <ArrowDownIcon
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
          </HeadlessDisclosure.Button>
          <HeadlessDisclosure.Panel unmount={false} className="pt-6">
            {children}
          </HeadlessDisclosure.Panel>
        </div>
      )}
    </HeadlessDisclosure>
  )
}
