import { Button } from '@unlock-protocol/ui'
import { useSelector } from '@xstate/react'
import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { CheckoutService } from './main/checkoutMachine'
import { Stepper } from './Stepper'
import { ConnectPage } from './main/ConnectPage'

interface ConnectedCheckoutProps {
  service: CheckoutService
  children?: ReactNode
}

export function Connected({ service, children }: ConnectedCheckoutProps) {
  const state = useSelector(service, (state) => state)
  const { account, isUnlockAccount, connected } = useAuth()
  const [signing, setSigning] = useState(false)
  const { signIn, isSignedIn } = useSIWE()

  const useDelegatedProvider =
    state.context?.paywallConfig?.useDelegatedProvider

  useEffect(() => {
    // Skip Connect if already signed in
    const autoSignIn = async () => {
      const isConnectedAsUnlockAccount =
        !isSignedIn && !signing && connected && isUnlockAccount

      const isConnectedWithWallet = isSignedIn && !signing && isUnlockAccount

      if (isConnectedAsUnlockAccount || isConnectedWithWallet) {
        await signIn()
        service.send({ type: 'SELECT_LOCK' })
      } else if (account && connected) {
        service.send({ type: 'SELECT_LOCK' })
      }
    }
    autoSignIn()
    // adding signIn creates an inifnite loop for some reason
  }, [connected, useDelegatedProvider, isUnlockAccount, signing, isSignedIn])

  useEffect(() => {
    if (!account) {
      console.debug('Not connected')
    } else {
      console.debug(`Connected as ${account}`)
    }
  }, [account])

  const signToSignIn = async () => {
    setSigning(true)
    await signIn()
    setSigning(false)
  }

  if (useDelegatedProvider) {
    if (isSignedIn) {
      return <div className="space-y-2">{children}</div>
    }
    return (
      <Button
        disabled={!connected || signing}
        loading={signing}
        onClick={signToSignIn}
        className="w-full"
      >
        Continue
      </Button>
    )
  }

  return (
    <>
      <Stepper service={service} />
      <ConnectPage style="h-full mt-4 space-y-4" connected={connected} />
    </>
  )
}
