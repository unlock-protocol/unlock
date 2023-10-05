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
import { ConfirmCrossmint } from './Confirm/ConfirmCrossmint'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConfirmUniversalCard } from './Confirm/ConfirmUniversalCard'
import { ConfirmCrossChainPurchase } from './Confirm/ConfirmCrossChainPurchase'

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
  const { payment, paywallConfig, messageToSign, metadata } = state.context
  const { account } = useAuth()

  const onError = (message: string) => {
    ToastHelper.error(message)
  }

  const onConfirmed = (lock: string, hash?: string, network?: number) => {
    // If not pessimistic, we can emit the transaction info right away
    // and pass the signed message as well
    if (!paywallConfig.pessimistic && hash) {
      communication?.emitTransactionInfo({
        hash,
        lock,
        metadata,
        network,
      })
      communication?.emitUserInfo({
        address: account,
        signedMessage: messageToSign?.signature,
      })
      communication?.emitMetadata(metadata)
    }
    send({
      type: 'CONFIRM_MINT',
      status: paywallConfig.pessimistic ? 'PROCESSING' : 'FINISHED',
      transactionHash: hash!,
      network,
    })
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      {payment.method === 'card' && (
        <ConfirmCard
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'swap_and_purchase' && (
        <ConfirmSwapAndPurchase
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crosschain_purchase' && (
        <ConfirmCrossChainPurchase
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crossmint' && (
        <ConfirmCrossmint
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crypto' && (
        <ConfirmCrypto
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'claim' && (
        <ConfirmClaim
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'universal_card' && (
        <ConfirmUniversalCard
          checkoutService={checkoutService}
          injectedProvider={injectedProvider}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
    </Fragment>
  )
}
