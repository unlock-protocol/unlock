import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { MdClose as CloseIcon } from 'react-icons/md'

interface DrawerInterface {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  title: string
}

/**
 * A side drawer component
 */
export const Drawer = ({
  isOpen,
  setIsOpen,
  children,
  title,
}: DrawerInterface) => {
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
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
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
                  <div className="absolute top-0 right-0 h-12 w-12 p-4">
                    <CloseIcon size="25px" onClick={() => setIsOpen(false)} />
                  </div>
                </Transition.Child>
                <div className="h-full flex flex-col py-6 bg-[#FFFDF8] shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    {title && (
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {title}
                      </Dialog.Title>
                    )}
                  </div>

                  <div className="mt-2 relative flex-1 px-4 sm:px-6">
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
