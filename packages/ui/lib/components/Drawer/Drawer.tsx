import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IconButton } from '../IconButton/IconButton'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'

interface DrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  title: string
}

/**
 * A side drawer component
 */
export const Drawer = ({ isOpen, setIsOpen, children, title }: DrawerProps) => {
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
        className="fixed inset-0 overflow-hidden"
        onClose={setIsOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child {...easeOutTransaction}>
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={React.Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-md">
                <Transition.Child {...easeOutTransaction}>
                  <div className="absolute top-0 right-0 w-12 h-12 p-4">
                    <IconButton
                      icon={<CloseIcon />}
                      label="close"
                      size="small"
                      onClick={() => setIsOpen(false)}
                    />
                  </div>
                </Transition.Child>
                <div className="flex flex-col h-full py-6 overflow-y-scroll bg-white shadow-xl">
                  <div className="px-4 sm:px-6">
                    {title && (
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {title}
                      </Dialog.Title>
                    )}
                  </div>

                  <div className="relative flex-1 px-4 mt-2 sm:px-6">
                    {children}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
export default Drawer
