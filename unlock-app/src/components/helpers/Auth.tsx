import { Fragment, ReactNode, useState } from 'react'
import {
  AUTH_SESSION_KEY,
  IS_REFUSED_TO_SIGN_KEY,
  SessionAuth,
  login,
} from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWalletService } from '~/utils/withWalletService'
import { useLocalStorage } from '@rehooks/local-storage'
import { Button, Modal } from '@unlock-protocol/ui'
interface Props {
  children?: ReactNode
}

export const AuthModal = ({ show }: { show: boolean }) => {
  const walletService = useWalletService()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [_, setIsRefusedToSign] = useLocalStorage(IS_REFUSED_TO_SIGN_KEY, false)
  return (
    <Modal
      isOpen={show}
      setIsOpen={() => {
        setIsRefusedToSign(true)
      }}
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold"> Sign In</h3>
          <div className="text-gray-600">
            Please sign the message to continue.
          </div>
        </div>
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
      </div>
    </Modal>
  )
}

export const Auth = ({ children }: Props) => {
  const [auth] = useLocalStorage<SessionAuth>(AUTH_SESSION_KEY)
  const [isRefusedToSign] = useLocalStorage(IS_REFUSED_TO_SIGN_KEY, false)
  const { account } = useAuth()
  const useSIWE =
    !!account && auth?.walletAddress !== account && !isRefusedToSign

  return (
    <div>
      {children}
      <Fragment>
        <AuthModal show={useSIWE} />
      </Fragment>
    </div>
  )
}
