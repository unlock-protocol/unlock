import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IconButton } from '../IconButton/IconButton'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'

interface DrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  title: string
  description?: string
}

/**
 * A side drawer component
 */
export const Drawer = ({
  isOpen,
  setIsOpen,
  children,
  title,
  description,
}: DrawerProps) => {
  const easeOutTransaction = {
    as: React.Fragment,
    enter: 'ease-in-out duration-300',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'ease-in-out duration-300',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  }
  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="absolute inset-0 overflow-y-auto">
          <Transition.Child {...easeOutTransaction}>
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 w-full max-w-lg">
            <Transition.Child
              as={React.Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-full h-screen p-6 overflow-y-auto sm:max-w-lg bg-ui-secondary-100">
                <Transition.Child {...easeOutTransaction}>
                  <IconButton
                    icon={<CloseIcon className="fill-inherit" size={20} />}
                    label="close"
                    size="tiny"
                    onClick={() => setIsOpen(false)}
                  />
                </Transition.Child>
                <div className="mt-4 space-y-2">
                  <Dialog.Title className="text-xl font-medium text-gray-800">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="text-base text-gray-800">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <div className="relative flex-1">{children}</div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
export default Drawer
