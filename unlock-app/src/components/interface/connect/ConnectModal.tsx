'use client'

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'
import ConnectWalletComponent from './ConnectWalletComponent'

export const ConnectModal = () => {
  const { status, closeConnectModal, open } = useConnectModal()
  const { connected } = useAuth()

  const useUnlockAccount = status === 'unlock_account'
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeConnectModal}
        open={open}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DialogPanel className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50 backdrop-blur" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="z-10 w-full max-w-sm bg-white rounded-2xl py-4">
              <header className="p-6">
                <div className="flex px-1">
                  <div className="flex-1 font-bold ">
                    <h1 className="text-center">
                      {!connected
                        ? 'Connect Account'
                        : useUnlockAccount
                          ? 'Unlock Account'
                          : 'Connected Wallet'}
                    </h1>
                  </div>
                  <div>
                    <button
                      aria-label="close"
                      onClick={(event) => {
                        event.preventDefault()
                        closeConnectModal()
                      }}
                      className="p-1 rounded-full hover:bg-gray-50"
                    >
                      <CloseIcon size={22} />
                    </button>
                  </div>
                </div>
              </header>
              <ConnectWalletComponent shoudOpenConnectModal={true} />
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
