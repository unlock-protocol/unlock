import { Dialog, Transition } from '@headlessui/react'
import { Input } from '@unlock-protocol/ui'
import { Fragment } from 'react'

interface SelectCurrencyModalProps {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
}
export const SelectCurrencyModal: React.FC<SelectCurrencyModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Transition show={isOpen} appear as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          setIsOpen(false)
        }}
        open
      >
        <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="fixed inset-0 p-6 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full">
              <Dialog.Panel className="w-full max-w-md">
                <div className="px-6 text-left rounded-lg bg-ui-secondary-200 py-7">
                  <Input
                    label="Select a token as currency"
                    placeholder="Search or paste contract address"
                    className="bg-transparent"
                  />
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
