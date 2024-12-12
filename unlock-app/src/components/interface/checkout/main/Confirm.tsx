import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Stepper } from '../Stepper'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { ConfirmClaim } from './Confirm/ConfirmClaim'
import { ConfirmCard } from './Confirm/ConfirmCard'
import { ConfirmCrossmint } from './Confirm/ConfirmCrossmint'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { ConfirmCrossChainPurchaseWrapper } from './Confirm/ConfirmCrossChainPurchaseWrapper'
import { ConfirmCryptoWrapper } from './Confirm/ConfirmCryptoWrapper'

interface Props {
  checkoutService: CheckoutService
  communication?: CheckoutCommunication
}

export function Confirm({ checkoutService, communication }: Props) {
  const { payment, paywallConfig, messageToSign, metadata } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const { account } = useAuthenticate()

  const onError = (message: string) => {
    ToastHelper.error(message)
  }

  const onConfirmed = (lock: string, network: number, hash?: string) => {
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
      status: 'PROCESSING',
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
      {payment.method === 'crosschain_purchase' && (
        <ConfirmCrossChainPurchaseWrapper
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
        <ConfirmCryptoWrapper
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
