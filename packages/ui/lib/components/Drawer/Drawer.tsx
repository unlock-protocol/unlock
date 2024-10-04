import React from 'react'
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { IconButton } from '../IconButton/IconButton'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'

export interface DrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  title?: string
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
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={React.Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto relative w-screen max-w-xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-ui-secondary-100 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        {title && (
                          <DialogTitle className="text-xl font-medium text-gray-800">
                            {title}
                          </DialogTitle>
                        )}
                        <div className="ml-3 flex h-7 items-center">
                          <IconButton
                            icon={
                              <CloseIcon className="fill-inherit" size={20} />
                            }
                            label="close"
                            size="tiny"
                            onClick={() => setIsOpen(false)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {description && (
                        <Description className="text-base text-gray-800">
                          {description}
                        </Description>
                      )}
                      {children}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Drawer
