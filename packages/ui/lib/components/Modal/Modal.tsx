import React, { ReactNode } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
export interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children?: ReactNode
  empty?: boolean
}

export function Modal({ isOpen, setIsOpen, children, empty }: Props) {
  let content
  if (empty) {
    content = (
      <div className="flex flex-col items-center justify-center min-w-full min-h-screen overflow-auto">
        {children}
      </div>
    )
  } else {
    content = (
      <div className="block p-4 overflow-hidden transition-all transform bg-white border border-gray-100 rounded-lg shadow-xl sm:max-w-lg sm:w-full">
        <div className="flex items-center justify-end">
          <button
            className="hover:fill-brand-ui-primary"
            aria-label="close"
            onClick={(event) => {
              event.preventDefault()
              setIsOpen(false)
            }}
          >
            <CloseIcon className="fill-inherit" size={24} />
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
          </Transition.Child>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {content}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Modal
