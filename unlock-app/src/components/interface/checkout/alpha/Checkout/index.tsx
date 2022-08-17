import React, { useCallback, useEffect, useMemo } from 'react'
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
import { CheckoutHead, CheckoutTransition, TopNavigation } from '../Shell'
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

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
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
    },
    [
      communication,
      redirectURI,
      mint,
      messageToSign,
      paywallConfig.messageToSign,
    ]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount
      ?.getSnapshot()
      .can('BACK')
    const canBack = state.can('BACK')
    if (canBackInUnlockAccountService) {
      return () => unlockAccount.send('BACK')
    }
    if (canBack) {
      return () => checkoutService.send('BACK')
    }
    return undefined
  }, [state, checkoutService])

  const Content = useCallback(() => {
    switch (matched) {
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
      case 'PAYMENT': {
        return (
          <Payment
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
            communication={communication}
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
            communication={communication}
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
  }, [injectedProvider, onClose, checkoutService, matched, communication])

  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
        <TopNavigation onClose={onClose} onBack={onBack} />
        <CheckoutHead
          iconURL={paywallConfig.icon}
          title={paywallConfig.title}
        />
        <Content />
      </div>
    </CheckoutTransition>
  )
}
