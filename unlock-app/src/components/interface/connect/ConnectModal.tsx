'use client'

import React from 'react'
import { useConnectModal } from '~/hooks/useConnectModal'
import ConnectWalletComponent from './ConnectWalletComponent'
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'

export const ConnectModal = () => {
  const { closeConnectModal, open } = useConnectModal()

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeConnectModal}
      >
        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="w-96 h-auto p-4 overflow-hidden transition-all transform bg-white border border-gray-100 rounded-lg shadow-xl">
              <div className="flex items-center justify-end">
                <button
                  className="hover:fill-brand-ui-primary"
                  aria-label="close"
                  onClick={closeConnectModal}
                >
                  <CloseIcon className="fill-inherit" size={24} />
                </button>
              </div>
              <div className="py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                <ConnectWalletComponent />
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
