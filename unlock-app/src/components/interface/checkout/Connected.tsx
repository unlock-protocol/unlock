import { useSelector } from '@xstate/react'
import { useEffect, useState } from 'react'
import { CheckoutService } from './main/checkoutMachine'
import { Stepper } from './Stepper'
import { ConnectPage } from './main/ConnectPage'
import { getMembership } from '~/hooks/useMemberships'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { usePrivy } from '@privy-io/react-auth'
import { onSignedInWithPrivy } from '~/config/PrivyProvider'

interface ConnectedCheckoutProps {
  service: CheckoutService
}

export function Connected({ service }: ConnectedCheckoutProps) {
  const [showPrivyModal, setShowPrivyModal] = useState(true)
  const { paywallConfig, lock } = useSelector(service, (state) => state.context)
  // const { user } = usePrivy()
  const { signInWithPrivy, account } = useAuthenticate()

  const lockAddress = lock?.address
  const lockNetwork = lock?.network || paywallConfig.network
  const web3Service = useWeb3Service()

  // handle sign-in
  useEffect(() => {
    const handleSignIn = async () => {
      if (account) {
        console.debug(`Connected as ${account}`)
        // await onSignedInWithPrivy(user)
      } else {
        console.debug('Not connected')
        signInWithPrivy({
          onshowUI: () => {
            setShowPrivyModal(true)
          },
        })
      }
    }

    handleSignIn()
  }, [account])

  // check memberships after sign-in
  useEffect(() => {
    const checkMemberships = async (
      lockAddress: string,
      walletAddress: string,
      lockNetwork: number
    ) => {
      const membership = await getMembership(
        web3Service,
        lockAddress,
        walletAddress,
        lockNetwork
      )
      service.send({
        type: 'SELECT_LOCK',
        existingMember: !!membership?.member,
        expiredMember: !!membership?.expired,
      })
    }

    if (account && lockAddress && lockNetwork) {
      checkMemberships(lockAddress, account, lockNetwork)
    }
  }, [account, lockAddress, lockNetwork])

  return (
    <>
      <Stepper service={service} />
      <ConnectPage
        showPrivyModal={showPrivyModal}
        style="h-full space-y-4"
        checkoutService={service}
      />
    </>
  )
}
