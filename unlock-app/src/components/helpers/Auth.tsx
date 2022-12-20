import { ReactNode, useState, Fragment } from 'react'
import { AUTH_SESSION_KEY, SessionAuth, login } from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWalletService } from '~/utils/withWalletService'
import { useLocalStorage } from '@rehooks/local-storage'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
interface Props {
  children?: ReactNode
}

export const AuthModal = ({ show }: { show: boolean }) => {
  const walletService = useWalletService()
  const [isSigningIn, setIsSigningIn] = useState(false)
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        open={show}
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {}}
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
            <Dialog.Panel className="grid p-6 overflow-hidden transition-all transform bg-white border border-gray-100 rounded-lg shadow-xl gap-y-2 sm:max-w-lg sm:w-full">
              <Dialog.Title className="text-xl font-bold">Sign in</Dialog.Title>
              <Dialog.Description>
                You need to sign in to continue.
              </Dialog.Description>
              <Button
                disabled={isSigningIn}
                loading={isSigningIn}
                onClick={async (event) => {
                  event.preventDefault()
                  setIsSigningIn(true)
                  await login(walletService)
                  setIsSigningIn(false)
                }}
              >
                Sign In
              </Button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export const Auth = ({ children }: Props) => {
  const [auth] = useLocalStorage<SessionAuth>(AUTH_SESSION_KEY)
  const { account } = useAuth()
  const useSIWE = !!account && auth?.walletAddress !== account
  return (
    <div>
      {children}
      <AuthModal show={useSIWE} />
    </div>
  )
}
