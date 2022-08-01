import React, { useEffect } from 'react'
import type { PaywallConfig } from '~/unlockTypes'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine } from './checkoutMachine'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useActor, useInterpret } from '@xstate/react'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { Captcha } from './Captcha'
import { Returning } from './Returning'
import { Payment } from './Payment'
import { useAuth } from '~/contexts/AuthenticationContext'
import { isEqual } from 'lodash'
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
  const { account } = useAuth()
  const { mint, messageToSign } = state.context
  const matched = state.value.toString()
  const paywallConfigChanged = !isEqual(
    paywallConfig,
    state.context.paywallConfig
  )

  useEffect(() => {
    if (paywallConfigChanged) {
      checkoutService.send({
        type: 'UPDATE_PAYWALL_CONFIG',
        config: paywallConfig,
      })
    }
  }, [paywallConfig, checkoutService, paywallConfigChanged])

  useEffect(() => {
    const user = account ? { address: account } : {}
    if (communication.insideIframe) {
      communication.emitUserInfo(user)
    }
  }, [account, communication])

  const onClose = (params: Record<string, string> = {}) => {
    if (redirectURI) {
      if (mint && mint?.status === 'ERROR') {
        redirectURI.searchParams.append('error', 'access-denied')
      }

      if (paywallConfig.messageToSign && !messageToSign) {
        redirectURI.searchParams.append('error', 'user did not sign message')
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
      window.history.back()
    } else {
      communication.emitCloseModal()
    }
  }

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
    case 'PAYMENT': {
      return (
        <Payment
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
          communication={communication}
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
          communication={communication}
        />
      )
    }
    case 'UNLOCK_ACCOUNT': {
      return (
        <UnlockAccountSignIn
          onClose={onClose}
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

    case 'RETURNING': {
      return (
        <Returning
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
