import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
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

interface Props {
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function Confirm({ checkoutService, communication }: Props) {
  const { payment, paywallConfig, messageToSign, metadata } = useSelector(
    checkoutService,
    (state) => state.context
  )
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
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'swap_and_purchase' && (
        <ConfirmSwapAndPurchase
          checkoutService={checkoutService}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crosschain_purchase' && (
        <ConfirmCrossChainPurchase
          checkoutService={checkoutService}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crossmint' && (
        <ConfirmCrossmint
          checkoutService={checkoutService}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'crypto' && (
        <ConfirmCrypto
          checkoutService={checkoutService}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
      {payment.method === 'claim' && (
        <ConfirmClaim
          checkoutService={checkoutService}
          onConfirmed={onConfirmed}
          onError={onError}
        />
      )}
    </Fragment>
  )
}
