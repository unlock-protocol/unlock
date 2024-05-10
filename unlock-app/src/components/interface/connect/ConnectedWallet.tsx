import { useAuth } from '~/contexts/AuthenticationContext'
import { Button, Placeholder, minifyAddress } from '@unlock-protocol/ui'
import useClipboard from 'react-use-clipboard'
import { useSIWE } from '~/hooks/useSIWE'
import { useCallback, useEffect, useState } from 'react'
import { useConnectModal } from '~/hooks/useConnectModal'
import BlockiesSvg from 'blockies-react-svg'

interface ConnectedWalletProps {
  showIcon?: boolean
  onNext?: () => void
}

export const ConnectedWallet = ({
  showIcon = true,
  onNext,
}: ConnectedWalletProps) => {
  const { deAuthenticate, displayAccount, connected } = useAuth()
  const { closeConnectModal } = useConnectModal()
  const { session, signIn, signOut } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { isUnlockAccount } = useAuth()
  const [_, copy] = useClipboard(displayAccount!, {
    successDuration: 1000,
  })

  const onSignIn = useCallback(async () => {
    setIsSigningIn(true)
    await signIn()
    setIsSigningIn(false)
    closeConnectModal()
  }, [setIsSigningIn, signIn, closeConnectModal])

  const onSignOut = useCallback(async () => {
    setIsDisconnecting(true)
    await signOut()
    deAuthenticate()
    closeConnectModal()
    setIsDisconnecting(false)
  }, [signOut, deAuthenticate, setIsDisconnecting, closeConnectModal])

  useEffect(() => {
    if (connected && !session && isUnlockAccount) {
      onSignIn()
    }
  }, [connected, session, isUnlockAccount])

  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        {showIcon && (
          <BlockiesSvg
            address={connected!}
            size={14}
            className="rounded-full"
          />
        )}
        <div className="inline-flex items-center gap-2 text-lg font-bold">
          <button
            onClick={(event) => {
              event.preventDefault()
              copy()
            }}
            className="cursor-pointer"
          >
            {minifyAddress(displayAccount!)}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {isDisconnecting && (
          <Placeholder.Root className="grid w-full">
            <Placeholder.Line />
          </Placeholder.Root>
        )}
        {session && !isDisconnecting && (
          <div className="flex flex-col gap-4">
            <div className="text-gray-700">
              You are successfully verified as {minifyAddress(displayAccount!)}
            </div>
            {onNext && <Button onClick={onNext}>Continue</Button>}
          </div>
        )}
        {!session && !isDisconnecting && !isUnlockAccount && (
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-700">
              Sign message to confirm ownership of your account
            </h3>
            <Button loading={isSigningIn} onClick={onSignIn}>
              Confirm Ownership
            </Button>
          </div>
        )}
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button onClick={onSignOut} className="hover:text-ui-main-600">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
