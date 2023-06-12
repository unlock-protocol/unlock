import React, { useCallback, useEffect, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine } from './checkoutMachine'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useActor } from '@xstate/react'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { Captcha } from './Captcha'
import { Returning } from './Returning'
import { Payment } from './Payment'
import { Password } from './Password'
import { Promo } from './Promo'
import { useAuth } from '~/contexts/AuthenticationContext'
import { isEqual } from 'lodash'
import { CheckoutHead, TopNavigation } from '../Shell'
import { Renew } from './Renew'
import { Renewed } from './Renewed'
import { PaywallConfigType as PaywallConfig } from '@unlock-protocol/core'
import { Guild } from './Guild'
import { interpret } from 'xstate'
interface Props {
  injectedProvider: any
  paywallConfig: PaywallConfig
  communication?: ReturnType<typeof useCheckoutCommunication>
  redirectURI?: URL
  handleClose?: (params: Record<string, string>) => void
}

export function Checkout({
  paywallConfig,
  injectedProvider,
  communication,
  redirectURI,
  handleClose,
}: Props) {
  const checkoutService = interpret(checkoutMachine, {
    input: {
      paywallConfig,
    },
  })
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()

  const { mint, messageToSign } = state.context
  const matched = state.value.toString()
  const paywallConfigChanged = !isEqual(
    paywallConfig,
    state.context.paywallConfig
  )

  useEffect(() => {
    if (paywallConfigChanged) {
      send({
        type: 'UPDATE_PAYWALL_CONFIG',
        config: paywallConfig,
      })
    }
  }, [paywallConfig, send, paywallConfigChanged])

  useEffect(() => {
    const user = account ? { address: account } : {}
    if (communication?.insideIframe) {
      communication.emitUserInfo(user)
    }
  }, [account, communication])

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      // Reset the Paywall State!
      send({
        type: 'RESET_CHECKOUT',
      })
      if (handleClose) {
        handleClose(params)
      } else if (redirectURI) {
        const redirect = new URL(redirectURI.toString())
        if (mint && mint?.status === 'ERROR') {
          redirect.searchParams.append('error', 'access-denied')
        }

        if (paywallConfig.messageToSign && !messageToSign) {
          redirect.searchParams.append('error', 'user did not sign message')
        }

        if (messageToSign) {
          redirect.searchParams.append('signature', messageToSign.signature)
          redirect.searchParams.append('address', messageToSign.address)
        }
        for (const [key, value] of Object.entries(params)) {
          redirect.searchParams.append(key, value)
        }
        return window.location.assign(redirect)
      } else if (!communication?.insideIframe) {
        window.history.back()
      } else {
        communication.emitCloseModal()
      }
    },
    [
      handleClose,
      communication,
      redirectURI,
      mint,
      messageToSign,
      paywallConfig.messageToSign,
      send,
    ]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount?.getSnapshot().can({
      type: 'BACK',
    })
    const canBack = state.can({
      type: 'BACK',
    })
    if (canBackInUnlockAccountService) {
      return () =>
        unlockAccount.send({
          type: 'BACK',
        })
    }
    if (canBack) {
      return () =>
        send({
          type: 'BACK',
        })
    }
    return undefined
  }, [state, send])

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
      case 'GUILD': {
        return (
          <Guild
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }
      case 'PASSWORD': {
        return (
          <Password
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }

      case 'PROMO': {
        return (
          <Promo
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

      case 'RENEW': {
        return (
          <Renew
            communication={communication}
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
          />
        )
      }

      case 'RENEWED': {
        return (
          <Renewed
            onClose={onClose}
            injectedProvider={injectedProvider}
            checkoutService={checkoutService}
            communication={communication}
          />
        )
      }

      default: {
        return null
      }
    }
  }, [injectedProvider, onClose, send, matched, communication])

  return (
    <div className="bg-white z-10  shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation
        onClose={!paywallConfig?.persistentCheckout ? onClose : undefined}
        onBack={onBack}
      />
      <CheckoutHead iconURL={paywallConfig.icon} title={paywallConfig.title} />
      <Content />
    </div>
  )
}
