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
import { useActor, useInterpret, useMachine, useSelector } from '@xstate/react'

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

  const messageToSign = useSelector(
    checkoutService,
    (state) => state.context.messageToSign
  )
  const mint = useSelector(checkoutService, (state) => state.context.mint)

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
      for (const [key, value] of Object.entries(params)) {
        redirectURI.searchParams.append(key, value)
      }
      return window.location.assign(redirectURI)
    }
    if (!communication.insideIframe) {
      return window.history.back()
    }
  }

  const matched = state.value.toString()

  switch (matched) {
    case 'SELECT': {
      return (
        <Select
          onClose={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'QUANTITY': {
      return (
        <Quantity
          onClose={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'CARD': {
      return (
        <CardPayment
          onClose={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'METADATA': {
      return (
        <Metadata
          onClose={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'CONFIRM': {
      return (
        <Confirm
          onClose={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'MESSAGE_TO_SIGN': {
      return (
        <MessageToSign
          onClose={onClose}
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
          close={onClose}
          injectedProvider={injectedProvider}
          checkoutService={checkoutService}
        />
      )
    }
    case 'CAPTCHA': {
      return (
        <Captcha
          onClose={onClose}
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
