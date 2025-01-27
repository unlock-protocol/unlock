'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine } from './checkoutMachine'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useMachine } from '@xstate/react'
import { Captcha } from './Captcha'
import { Returning } from './Returning'
import { Payment } from './Payment'
import { Password } from './Password'
import { Promo } from './Promo'
import { isEqual } from 'lodash'
import { CheckoutHead, TopNavigation } from '../Shell'
import { PaywallConfigType } from '@unlock-protocol/core'
import { Guild } from './Guild'
import { Gitcoin } from './Gitcoin'
import { isInIframe } from '~/utils/iframe'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select } from './Select'
import { Connected } from '../Connected'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { AllowList } from './AllowList'
import PrivyFunding from './embedded-wallet/PrivyFunding'

interface Props {
  paywallConfig: PaywallConfigType
  redirectURI?: URL
  handleClose?: (params: Record<string, string>) => void
  communication?: ReturnType<typeof useCheckoutCommunication>
}

export function Checkout({
  paywallConfig,
  redirectURI,
  handleClose,
  communication,
}: Props) {
  // @ts-expect-error - The types returned by 'resolveState(...)' are incompatible between these types
  const [state, send, checkoutService] = useMachine(checkoutMachine, {
    input: {
      paywallConfig,
    },
  })
  const { account, signOut } = useAuthenticate()

  const { mint, messageToSign } = state.context
  const matched = state.value.toString()
  const paywallConfigChanged = !isEqual(
    paywallConfig,
    state.context.paywallConfig
  )

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

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
    if (isInIframe() && communication) {
      communication.emitUserInfo(user)
    }
  }, [account, communication])

  const messageToSignSignature = messageToSign?.signature
  const messageToSignSigner = messageToSign?.address

  const onClose = useCallback(
    async (params: Record<string, string> = {}) => {
      // Reset the Paywall State!
      checkoutService.send({ type: 'RESET_CHECKOUT' })
      if (handleClose) {
        handleClose(params)
      } else if (redirectURI) {
        const redirect = new URL(redirectURI.toString())
        if (mint && mint?.status === 'ERROR') {
          redirect.searchParams.append('error', 'access-denied')
        }

        if (!params.signature) {
          if (paywallConfig.messageToSign && !messageToSignSignature) {
            redirect.searchParams.append('error', 'user did not sign message')
          }

          if (messageToSignSignature) {
            redirect.searchParams.append('signature', messageToSignSignature)
            redirect.searchParams.append('address', messageToSignSigner)
          }
        }

        for (const [key, value] of Object.entries(params)) {
          redirect.searchParams.append(key, value)
        }
        return window.location.assign(redirect)
      } else if (!isInIframe() || !communication) {
        window.history.back()
      } else {
        if (paywallConfig?.useDelegatedProvider) {
          signOut()
          checkoutService.send({ type: 'DISCONNECT' })
        }
        communication.emitCloseModal()
      }
    },
    [
      checkoutService,
      handleClose,
      redirectURI,
      communication,
      mint,
      paywallConfig.messageToSign,
      messageToSignSignature,
      messageToSignSigner,
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

  useEffect(() => {
    if (
      matched !== 'SELECT' &&
      matched != 'CONNECT' &&
      searchParams.get('lock')
    ) {
      // Remove the lock from the query string
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('lock')
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      })
    }
  }, [router, searchParams, matched, pathname])

  const Content = useCallback(() => {
    switch (matched) {
      case 'CONNECT': {
        return <Connected service={checkoutService} />
      }
      case 'SELECT': {
        return <Select checkoutService={checkoutService} />
      }
      case 'QUANTITY': {
        return <Quantity checkoutService={checkoutService} />
      }
      case 'PAYMENT': {
        return <Payment checkoutService={checkoutService} />
      }
      case 'CARD': {
        return <CardPayment checkoutService={checkoutService} />
      }
      case 'PRIVY_FUNDING': {
        return <PrivyFunding checkoutService={checkoutService} />
      }
      case 'METADATA': {
        return <Metadata checkoutService={checkoutService} />
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
      case 'ALLOW_LIST': {
        return <AllowList checkoutService={checkoutService} />
      }
      case 'RETURNING': {
        return (
          <Returning
            onClose={onClose}
            communication={communication}
            checkoutService={checkoutService}
          />
        )
      }
      default: {
        return null
      }
    }
  }, [matched])

  return (
    <div className="bg-white z-10  shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem] text-left">
      <TopNavigation
        onClose={!paywallConfig?.persistentCheckout ? onClose : undefined}
        onBack={onBack}
      />
      <CheckoutHead iconURL={paywallConfig.icon} title={paywallConfig.title} />
      <Content />
    </div>
  )
}
