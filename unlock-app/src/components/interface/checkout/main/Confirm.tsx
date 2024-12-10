import { CheckoutService } from './checkoutMachine'
import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Stepper } from '../Stepper'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { ConfirmClaim } from './Confirm/ConfirmClaim'
import { ConfirmCrypto } from './Confirm/ConfirmCrypto'
import { ConfirmCard } from './Confirm/ConfirmCard'
import { ConfirmCrossmint } from './Confirm/ConfirmCrossmint'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { ConfirmCrossChainPurchaseWrapper } from './Confirm/ConfirmCrossChainPurchaseWrapper'

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
      communication?.emitTransactionInfo(
        {
          hash,
          lock,
          metadata,
          network,
        },
        paywallConfig
      )
      communication?.emitUserInfo(
        {
          address: account,
          signedMessage: messageToSign?.signature,
        },
        paywallConfig
      )
      communication?.emitMetadata(metadata, paywallConfig)
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
