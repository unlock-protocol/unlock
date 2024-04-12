import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useActor, useSelector } from '@xstate/reactv4'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Stepper } from '../Stepper'
import { ToastHelper } from '~/components/helpers/toast.helper'

import { ConfirmClaim } from './Confirm/ConfirmClaim'
import { ConfirmCrypto } from './Confirm/ConfirmCrypto'
import { ConfirmSwapAndPurchase } from './Confirm/ConfirmSwapAndPurchase'
import { ConfirmCard } from './Confirm/ConfirmCard'
import { ConfirmCrossmint } from './Confirm/ConfirmCrossmint'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConfirmCrossChainPurchase } from './Confirm/ConfirmCrossChainPurchase'
import { ActorRef } from 'xsatev5'

interface Props {
  injectedProvider: unknown
  checkoutService: ActorRef<any, any>
  communication?: CheckoutCommunication
}

export function Confirm({
  injectedProvider,
  checkoutService,
  communication,
}: Props) {
  const state = useSelector(checkoutService, (s) => s)
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
    checkoutService.send({
      type: 'CONFIRM_MINT',
      params: {
        status: paywallConfig.pessimistic ? 'PROCESSING' : 'FINISHED',
        transactionHash: hash!,
        network,
      },
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
    </Fragment>
  )
}
