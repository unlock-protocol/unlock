import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { ConnectWallet } from './Wallet'
import { ConnectUnlockAccount } from './UnlockAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectedWallet } from './ConnectedWallet'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export const ConnectModal = ({ open, setOpen }: Props) => {
  const [useUnlockAccount, setUseUnlockAccount] = useState(false)
  const { isConnected } = useAuth()
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <Transition.Child
            as={Fragment}
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
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="z-10 w-full max-w-sm bg-white rounded-2xl">
              <header className="p-6">
                <div className="flex px-1">
                  <div className="flex-1 font-bold ">
                    <h1 className="text-center">
                      {isConnected
                        ? 'Connected Account'
                        : useUnlockAccount
                        ? 'Unlock Account'
                        : 'Connect Wallet'}{' '}
                    </h1>
                  </div>
                  <div>
                    <button
                      aria-label="close"
                      onClick={(event) => {
                        event.preventDefault()
                        setOpen(false)
                      }}
                      className="p-1 rounded-full hover:bg-gray-50"
                    >
                      <CloseIcon size={22} />
                    </button>
                  </div>
                </div>
              </header>
              {!useUnlockAccount && !isConnected && (
                <ConnectWallet
                  onUnlockAccount={() => {
                    setUseUnlockAccount(true)
                  }}
                />
              )}
              {useUnlockAccount && !isConnected && (
                <ConnectUnlockAccount
                  onExit={() => {
                    setUseUnlockAccount(false)
                  }}
                />
              )}
              {isConnected && <ConnectedWallet />}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
