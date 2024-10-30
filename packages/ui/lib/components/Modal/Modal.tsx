import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'

export interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children?: ReactNode
  empty?: boolean
  size?: 'small' | 'medium' | 'large'
}

const sizeClasses = {
  small: 'max-w-sm',
  medium: 'max-w-lg',
  large: 'max-w-4xl',
}

export function Modal({
  isOpen,
  setIsOpen,
  children,
  empty,
  size = 'medium',
}: Props) {
  const sizeClass = sizeClasses[size]

  let content
  if (empty) {
    content = (
      <div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
        {children}
      </div>
    )
  } else {
    content = (
      <div
        className={`relative w-full ${sizeClass} mx-auto overflow-hidden transition-all transform bg-white border border-gray-100 rounded-lg shadow-xl`}
      >
        <div className="absolute top-4 right-4">
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
        <div className="p-6 mt-8">{children}</div>
      </div>
    )
  }

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={setIsOpen}
      >
        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
        <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:p-0">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {content}
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
