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
import { useMachine } from '@xstate/react'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { Captcha } from './Captcha'
import { Returning } from './Returning'
import { Payment } from './Payment'
import { Password } from './Password'
import { Promo } from './Promo'
import { useAuth } from '~/contexts/AuthenticationContext'
import { isEqual } from 'lodash'
import { CheckoutHead, TopNavigation } from '../Shell'
import { PaywallConfigType } from '@unlock-protocol/core'
import { Guild } from './Guild'
import { Gitcoin } from './Gitcoin'
import { Connected } from '../Connected'
interface Props {
  injectedProvider: any
  paywallConfig: PaywallConfigType
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
  // @ts-expect-error - The types returned by 'resolveState(...)' are incompatible between these types
  const [state, send, checkoutService] = useMachine(checkoutMachine, {
    input: {
      paywallConfig,
    },
  })
  const { account } = useAuth()

  const { mint, messageToSign } = state.context
  const matched = state.value.toString()
  const paywallConfigChanged = !isEqual(
    paywallConfig,
    state.context.paywallConfig
  )

  useEffect(() => {
    console.debug('Unlock paywall config', paywallConfig)
  }, [paywallConfig])

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
    if (communication?.insideIframe) {
      communication.emitUserInfo(user)
    }
  }, [account, communication])

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      // Reset the Paywall State!
      checkoutService.send({ type: 'RESET_CHECKOUT' })
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
      checkoutService,
    ]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount
      ?.getSnapshot()
      .can('BACK')
    const canBack = state.can({ type: 'BACK' })
    if (canBackInUnlockAccountService) {
      return () => unlockAccount.send('BACK')
    }
    if (canBack) {
      return () => checkoutService.send({ type: 'BACK' })
    }
    return undefined
  }, [state, checkoutService])

  const Content = useCallback(() => {
    switch (matched) {
      case 'CONNECT': {
        return (
          <Connected
            service={checkoutService}
            injectedProvider={injectedProvider}
          />
        )
      }
      case 'SELECT': {
        return <Select checkoutService={checkoutService} />
      }
      case 'QUANTITY': {
        return <Quantity checkoutService={checkoutService} />
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
        return <CardPayment checkoutService={checkoutService} />
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
            checkoutService={checkoutService}
            communication={communication}
          />
        )
      }
      case 'MESSAGE_TO_SIGN': {
        return (
          <MessageToSign
            checkoutService={checkoutService}
            communication={communication}
          />
        )
      }
      case 'MINTING': {
        return (
          <Minting
            onClose={onClose}
            checkoutService={checkoutService}
            communication={communication}
          />
        )
      }
      case 'UNLOCK_ACCOUNT': {
        return <UnlockAccountSignIn checkoutService={checkoutService} />
      }
      case 'CAPTCHA': {
        return <Captcha checkoutService={checkoutService} />
      }
      case 'GUILD': {
        return <Guild checkoutService={checkoutService} />
      }
      case 'PASSWORD': {
        return <Password checkoutService={checkoutService} />
      }

      case 'PROMO': {
        return <Promo checkoutService={checkoutService} />
      }
      case 'GITCOIN': {
        return <Gitcoin checkoutService={checkoutService} />
      }
      case 'RETURNING': {
        return (
          <Returning
            communication={communication}
            onClose={onClose}
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
