import { Disclosure } from '@headlessui/react'
import { BsPlusLg as PlusIcon } from 'react-icons/bs'
import { Icon } from '@unlock-protocol/ui'
import { ReactNode } from 'react'

interface AboutDetailProps {
  title: string
  icon: ReactNode
  children?: any
}

export const AboutDisclosure = ({
  title,
  icon,
  children,
}: AboutDetailProps) => {
  return (
    <Disclosure>
      {() => (
        <>
          <Disclosure.Button className="flex flex-col items-center w-full gap-6 py-6 text-left md:gap-0 md:items-center md:justify-between md:flex-row">
            <span className="text-5xl font-bold md:text-7xl">{title}</span>
            <div className="flex items-center justify-between w-full gap-4 text-left md:items-center md:justify-start md:w-auto">
              <span className="text-5xl md:text-6xl">{icon}</span>
              <Icon icon={PlusIcon} size={30} />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
