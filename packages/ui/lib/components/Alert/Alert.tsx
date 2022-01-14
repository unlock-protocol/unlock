import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IconButton } from '../IconButton/IconButton'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'
interface AlertInterface {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  text: string
  title: string
}

/**
 * An alert component
 * Usage: Import both the `Alert` component and `useAlert` hook into your own components.
 * Hook:
 * const { openAlert, alertProps } = useAlert()
 * Render:
 * <Alert {...alertProps} />
 */
export const Alert = ({ isOpen, setIsOpen, text, title }: AlertInterface) => (
  <Transition.Root show={isOpen} as={React.Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      onClose={setIsOpen}
    >
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="absolute top-0 right-0 w-12 h-12 p-4">
              <IconButton
                icon={<CloseIcon />}
                label="close"
                size="small"
                onClick={() => setIsOpen(false)}
              />
            </div>
            <div className="px-4 pt-5 pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  {title && (
                    <Dialog.Title
                      as="h2"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                  )}
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
)

export default Alert
