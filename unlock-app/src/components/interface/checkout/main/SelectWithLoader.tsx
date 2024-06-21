import { Fragment } from 'react'
import { Select } from './Select'
import { CheckoutService } from './checkoutMachine'
import { Stepper } from '../Stepper'
import ConnectingWaas from '../../connect/ConnectingWaas'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { useSession } from 'next-auth/react'

export const SelectWithLoader = ({
  checkoutService,
}: {
  checkoutService: CheckoutService
}) => {
  const { account } = useAuth()
  const { connected } = useAuth()
  const { isSignedIn } = useSIWE()

  const { data: session } = useSession()
  const isLoadingWaas = session && (!connected || !isSignedIn || account === '')

  if (isLoadingWaas) {
    return (
      <Fragment>
        <Stepper service={checkoutService} />
        <main className="h-full mt-4 space-y-5">
          <ConnectingWaas openConnectModalWindow={false} />
        </main>
        <footer className="grid items-center px-6 pt-6 border-t">
          <PoweredByUnlock />
        </footer>
      </Fragment>
    )
  }

  return <Select checkoutService={checkoutService} />
}
