import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Stepper } from '../Stepper'
import { ToastHelper } from '~/components/helpers/toast.helper'

import { ConfirmClaim } from './Confirm/ConfirmClaim'
import { ConfirmCrypto } from './Confirm/ConfirmCrypto'
import { ConfirmSwapAndPurchase } from './Confirm/ConfirmSwapAndPurchase'
import { ConfirmCard } from './Confirm/ConfirmCard'

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
  const [state, send] = useActor(checkoutService)
  const { payment } = state.context

  const onError = (message: string) => {
    ToastHelper.error(message)
  }

  const onConfirmed = (lock: string, hash: string) => {
    communication?.emitTransactionInfo({
      hash,
      lock,
    })
    send({
      type: 'CONFIRM_MINT',
      status: 'FINISHED',
      transactionHash: hash,
    })
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      {payment.method === 'card' && (
        <ConfirmCard
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'swap_and_purchase' && (
        <ConfirmSwapAndPurchase
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crypto' && (
        <ConfirmCrypto
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'claim' && (
        <ConfirmClaim
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          communication={communication}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
    </Fragment>
  )
}
