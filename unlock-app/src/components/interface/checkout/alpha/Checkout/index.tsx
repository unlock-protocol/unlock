import React, { useEffect } from 'react'
import type { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine, CheckoutPage } from './checkoutMachine'
import { Shell } from '../Shell'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { useActor, useInterpret, useMachine } from '@xstate/react'

import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { Captcha } from './Captcha'
interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  communication: ReturnType<typeof useCheckoutCommunication>
  redirectURI?: URL
}

export function Checkout({
  paywallConfig,
  injectedProvider,
  communication,
  redirectURI,
}: Props) {
  const checkoutService = useInterpret(checkoutMachine, {
    context: {
      paywallConfig,
    },
  })
  const [state] = useActor(checkoutService)
  const { description } = useCheckoutHeadContent(
    paywallConfig,
    state.value as CheckoutPage
  )
  const { messageToSign, mint, lock } = state.context

  useEffect(() => {
    const isMintingFinished =
      mint && mint.transactionHash && mint.status === 'FINISHED'
    if (isMintingFinished && communication) {
      communication.emitTransactionInfo({
        hash: mint!.transactionHash!,
        lock: lock!.address,
      })
    }
  }, [mint, communication, lock])

  const onClose = (params: Record<string, string> = {}) => {
    communication.emitCloseModal()
    if (redirectURI) {
      if (!mint || mint?.status === 'ERROR') {
        redirectURI.searchParams.append('error', 'access-denied')
      }
      if (messageToSign) {
        redirectURI.searchParams.append('signature', messageToSign.signature)
        redirectURI.searchParams.append('address', messageToSign.address)
      }
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          redirectURI.searchParams.append(key, value)
        }
      }
      return window.location.assign(redirectURI)
    }
    if (!communication.insideIframe) {
      return window.history.back()
    }
  }

  function Content() {
    switch (state.value) {
      case 'SELECT': {
        return (
          <Select
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'QUANTITY': {
        return (
          <Quantity
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'CARD': {
        return (
          <CardPayment
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'METADATA': {
        return (
          <Metadata
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'CONFIRM': {
        return (
          <Confirm
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'MESSAGE_TO_SIGN': {
        return (
          <MessageToSign
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'MINTING': {
        return (
          <Minting
            onClose={onClose}
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'UNLOCK_ACCOUNT': {
        return (
          <UnlockAccountSignIn
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'CAPTCHA': {
        return (
          <Captcha
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <Shell.Root onClose={onClose}>
      <Shell.Head
        description={description}
        title={paywallConfig.title!}
        iconURL={paywallConfig.icon!}
      />
      <Content />
    </Shell.Root>
  )
}
