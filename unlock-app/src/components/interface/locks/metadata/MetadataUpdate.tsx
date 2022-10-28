import { Transition, Dialog } from '@headlessui/react'
import { Fragment } from 'react'
import { UpdateLockMetadata } from '.'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { Lock } from '~/unlockTypes'
interface Props {
  isOpen: boolean
  setIsOpen(value: boolean): Promise<void> | void
  lock?: Lock
}

export function UpdateMetadataDrawer({ isOpen, setIsOpen }: Props) {
  const easeOutTransaction = {
    as: Fragment,
    enter: 'ease-in-out duration-300',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'ease-in-out duration-300',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  }
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="absolute inset-0 overflow-y-auto">
          <Transition.Child {...easeOutTransaction}>
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-full h-screen p-6 overflow-y-auto bg-ui-secondary-100">
                <Transition.Child {...easeOutTransaction}>
                  <button
                    aria-label="close"
                    className="hover:fill-brand-ui-primary"
                    onClick={() => {
                      setIsOpen(false)
                    }}
                  >
                    <CloseIcon className="fill-inherit" size={24} />
                  </button>
                </Transition.Child>
                <div className="mt-4 space-y-2">
                  <Dialog.Title className="text-xl font-medium text-gray-800"></Dialog.Title>
                  <Dialog.Description className="text-base text-gray-800"></Dialog.Description>
                </div>
                <div className="relative flex-1">
                  <UpdateLockMetadata />
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
