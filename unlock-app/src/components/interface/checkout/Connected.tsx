import { useSelector } from '@xstate/react'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './main/checkoutMachine'
import { Stepper } from './Stepper'
import { ConnectPage } from './main/ConnectPage'
import { getMembership } from '~/hooks/useMemberships'

interface ConnectedCheckoutProps {
  service: CheckoutService
}

export function Connected({ service }: ConnectedCheckoutProps) {
  const { paywallConfig, lock } = useSelector(service, (state) => state.context)

  const { account } = useAuth()

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
    if (lockAddress && lockNetwork && account) {
      checkMemberships(lockAddress, account!, lockNetwork)
    }
  }, [account, lockAddress, lockNetwork])

  // Debugging details!
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
      <ConnectPage style="h-full mt-4 space-y-4" checkoutService={service} />
    </>
  )
}
