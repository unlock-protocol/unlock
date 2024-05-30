import { useSelector } from '@xstate/react'
import { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { CheckoutService } from './main/checkoutMachine'
import { Stepper } from './Stepper'
import { ConnectPage } from './main/ConnectPage'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useMembership } from '~/hooks/useMembership'

interface ConnectedCheckoutProps {
  service: CheckoutService
}

export function Connected({ service }: ConnectedCheckoutProps) {
  const state = useSelector(service, (state) => state)
  const { account, isUnlockAccount, connected } = useAuth()
  const [signing, _] = useState(false)
  const { signIn, isSignedIn } = useSIWE()

  const web3Service = useWeb3Service()

  const useDelegatedProvider =
    state.context?.paywallConfig?.useDelegatedProvider

  const { data: memberships } = useMembership({
    account,
    paywallConfig: state.context.paywallConfig,
    web3Service,
  })

  const membership = memberships?.find(
    (item) => item.lock === state.context.lock?.address
  )

  useEffect(() => {
    // Skip Connect if already signed in
    const autoSignIn = async () => {
      const isConnectedAsUnlockAccount =
        isSignedIn && !signing && isUnlockAccount && !useDelegatedProvider

      const isConnectedWithWallet =
        isSignedIn && !signing && !isUnlockAccount && !useDelegatedProvider

      if (isConnectedWithWallet) {
        await signIn()

        service.send({
          type: 'SELECT_LOCK',
          existingMember: !!membership?.member,
          expiredMember: isUnlockAccount ? false : !!membership?.expired,
        })
      } else if (isConnectedAsUnlockAccount) {
        service.send({
          type: 'SELECT_LOCK',
          existingMember: !!membership?.member,
          expiredMember: isUnlockAccount ? false : !!membership?.expired,
        })
      } else if (account && connected) {
        service.send({
          type: 'SELECT_LOCK',
          existingMember: !!membership?.member,
          expiredMember: isUnlockAccount ? false : !!membership?.expired,
        })
      }
    }
    if (memberships) {
      autoSignIn()
    }
    // adding signIn creates an inifnite loop for some reason
  }, [
    connected,
    useDelegatedProvider,
    isUnlockAccount,
    signing,
    isSignedIn,
    memberships,
  ])

  useEffect(() => {
    if (!account) {
      console.debug('Not connected')
    } else {
      console.debug(`Connected as ${account}`)
    }
  }, [account])

  return (
    <>
      <Stepper service={service} />
      <ConnectPage style="h-full mt-4 space-y-4" connected={connected} />
    </>
  )
}
