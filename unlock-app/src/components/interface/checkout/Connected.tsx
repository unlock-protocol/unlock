import { useSelector } from '@xstate/react'
import { useEffect, useState } from 'react'
import { CheckoutService } from './main/checkoutMachine'
import { Stepper } from './Stepper'
import { ConnectPage } from './main/ConnectPage'
import { getMembership } from '~/hooks/useMemberships'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface ConnectedCheckoutProps {
  service: CheckoutService
}

export function Connected({ service }: ConnectedCheckoutProps) {
  const [showPrivyModal, setShowPrivyModal] = useState(true)
  const { paywallConfig, lock } = useSelector(service, (state) => state.context)
  const { account, signInWithPrivy } = useAuthenticate()

  const lockAddress = lock?.address
  const lockNetwork = lock?.network || paywallConfig.network

  useEffect(() => {
    const checkMemberships = async (
      lockAddress: string,
      account: string,
      lockNetwork: number
    ) => {
      // Get the membership!
      const membership = await getMembership(lockAddress, account!, lockNetwork)
      service.send({
        type: 'SELECT_LOCK',
        existingMember: !!membership?.member,
        expiredMember: !!membership?.expired,
      })
    }
    if (!account) {
      console.debug('Not connected')
      signInWithPrivy({
        onshowUI: () => {
          setShowPrivyModal(true)
        },
      })
    } else {
      console.debug(`Connected as ${account}`)
      if (lockAddress && lockNetwork) {
        checkMemberships(lockAddress, account!, lockNetwork)
      }
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
