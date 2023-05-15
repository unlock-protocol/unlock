import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Stepper } from '../Stepper'

import { ConfirmClaim } from './Confirm/ConfirmClaim'
import { ConfirmCrypto } from './Confirm/ConfirmCrypto'
import { ConfirmSwapAndPurchaser } from './Confirm/ConfirmSwapAndPurchase'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function Confirm({
  injectedProvider,
  checkoutService,
  communication,
}: Props) {
  const [state] = useActor(checkoutService)
  const { payment } = state.context

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      {payment.method === 'card' && <p>Card</p>}
      {payment.method === 'swap_and_purchase' && (
        <ConfirmSwapAndPurchaser
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
        />
      )}
      {payment.method === 'crypto' && (
        <ConfirmCrypto
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
        />
      )}
      {payment.method === 'claim' && (
        <ConfirmClaim
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
        />
      )}
    </Fragment>
  )
}
