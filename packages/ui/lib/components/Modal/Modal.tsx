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
  spacing?: 'small' | 'medium' | 'large' | 'none'
  closeIconStyle?: string
  hideCloseIcon?: boolean
  disableBottomSheet?: boolean
}

const sizeClasses = {
  small: 'sm:max-w-sm',
  medium: 'sm:max-w-lg',
  large: 'sm:max-w-4xl',
}

const spacingClasses = {
  small: 'p-4 sm:mt-6',
  medium: 'p-6 sm:mt-8',
  large: 'p-8 sm:mt-10',
  none: '',
}

export function Modal({
  isOpen,
  setIsOpen,
  children,
  empty,
  size = 'medium',
  spacing = 'small',
  closeIconStyle = 'fill-inherit',
  hideCloseIcon = false,
  disableBottomSheet = false,
}: Props) {
  const sizeClass = sizeClasses[size]
  const spacingClass = spacingClasses[spacing]

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
        className={`relative w-full ${sizeClass} mx-auto overflow-hidden transition-all transform bg-white border-none ${
          disableBottomSheet
            ? 'rounded-xl'
            : 'rounded-t-xl rounded-b-none sm:rounded-xl'
        } shadow-xl`}
      >
        {!hideCloseIcon && (
          <div className="absolute top-4 right-4">
            <button
              aria-label="close"
              onClick={(event) => {
                event.preventDefault()
                setIsOpen(false)
              }}
            >
              <CloseIcon className={closeIconStyle} size={24} />
            </button>
          </div>
        )}
        <div className={spacingClass}>{children}</div>
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
        <div
          className={`flex min-h-screen text-center sm:p-0 ${
            disableBottomSheet ? 'items-center' : 'items-end sm:items-center'
          } justify-center`}
        >
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom={`opacity-0 ${disableBottomSheet ? 'translate-y-4 sm:translate-y-4' : 'translate-y-[100%] sm:translate-y-4'} sm:scale-95`}
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo={`opacity-0 ${disableBottomSheet ? 'translate-y-4 sm:translate-y-4' : 'translate-y-[100%] sm:translate-y-4'} sm:scale-95`}
          >
            {content}
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
