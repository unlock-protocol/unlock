import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectButton } from './Custom'
import { Button, Placeholder, minifyAddress } from '@unlock-protocol/ui'
import { AiOutlineDisconnect as DisconnectIcon } from 'react-icons/ai'
import useClipboard from 'react-use-clipboard'
import { useSIWE } from '~/hooks/useSIWE'
import { useCallback, useEffect, useState } from 'react'
import { useConnectModal } from '~/hooks/useConnectModal'
import BlockiesSvg from 'blockies-react-svg'
import { useHasEmail } from '~/hooks/useHasEmail'

export const ConnectedWallet = () => {
  const { deAuthenticate, displayAccount, connected } = useAuth()
  const { closeConnectModal } = useConnectModal()
  const { session, signIn, signOut } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { isUnlockAccount } = useAuth()
  const [_, copy] = useClipboard(displayAccount!, {
    successDuration: 1000,
  })

  const { data: hasEmail, isLoading: hasEmailIsLoading } = useHasEmail()

  const onSignIn = useCallback(async () => {
    setIsSigningIn(true)
    await signIn()
    setIsSigningIn(false)
    if (!hasEmailIsLoading && hasEmail) {
      closeConnectModal()
    }
  }, [setIsSigningIn, signIn, closeConnectModal, hasEmailIsLoading, hasEmail])

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
  }, [onSignIn, connected, session, isUnlockAccount])

  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <BlockiesSvg address={connected!} size={14} className="rounded-full" />
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
        {!isDisconnecting && (
          <>
            {session && (
              <>
                {hasEmail && (
                  <div className="text-gray-700">
                    You are successfully verified as{' '}
                    {minifyAddress(displayAccount!)}
                  </div>
                )}
                {!hasEmail && <>Save your email address!</>}
              </>
            )}
            {!session && (
              <div className="flex flex-col gap-4">
                <h3 className="text-gray-700">
                  Sign message to confirm ownership of your account
                </h3>
                <Button loading={isSigningIn} onClick={onSignIn}>
                  Confirm Ownership
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="grid p-6">
        <ConnectButton
          onClick={onSignOut}
          loading={isDisconnecting}
          icon={<DisconnectIcon size={24} />}
        >
          Disconnect
        </ConnectButton>
      </div>
    </div>
  )
}
