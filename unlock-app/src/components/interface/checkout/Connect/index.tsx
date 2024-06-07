import React, { useCallback, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { connectMachine } from './connectMachine'
import { CheckoutHead, TopNavigation } from '../Shell'
import { useMachine } from '@xstate/react'
import ConnectWalletComponent from '../../connect/ConnectWalletComponent'
import { generateNonce } from 'siwe'
import { useSIWE } from '~/hooks/useSIWE'
import { useAuth } from '~/contexts/AuthenticationContext'
import { PaywallConfigType } from '@unlock-protocol/core'

interface Props {
  oauthConfig: OAuthConfig
  paywallConfig: PaywallConfigType
}

export function Connect({ paywallConfig, oauthConfig }: Props) {
  const communication = useCheckoutCommunication()

  // @ts-expect-error - The types returned by 'resolveState(...)' are incompatible between these types
  const [state, send, connectService] = useMachine(connectMachine)

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      // Reset the Paywall State!
      connectService.send({ type: 'DISCONNECT' })

      if (oauthConfig.redirectUri) {
        const redirectURI = new URL(oauthConfig.redirectUri)

        for (const [key, value] of Object.entries(params)) {
          redirectURI.searchParams.append(key, value)
        }
        return window.location.assign(redirectURI)
      } else if (!communication?.insideIframe) {
        window.history.back()
      } else {
        communication.emitCloseModal()
      }
    },
    [oauthConfig.redirectUri, communication, connectService]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount
      ?.getSnapshot()
      .can({ type: 'BACK' })
    const canBack = state.can({ type: 'BACK' })
    if (canBackInUnlockAccountService) {
      return () => unlockAccount.send({ type: 'BACK' })
    }
    if (canBack) {
      return () => connectService.send({ type: 'BACK' })
    }
    return undefined
  }, [state, connectService])

  const { siweSign, signature, message } = useSIWE()
  const { account } = useAuth()

  const onSuccess = (signature: string, message: string) => {
    const code = Buffer.from(
      JSON.stringify({
        d: message,
        s: signature,
      })
    ).toString('base64')
    communication?.emitUserInfo({
      address: account,
      message: message,
      signedMessage: signature,
    })
    onClose({
      code,
      state: oauthConfig.state,
    })
  }

  const onSignIn = async () => {
    if (signature && message) {
      onSuccess(signature, message)
    } else {
      const result = await siweSign(
        generateNonce(),
        paywallConfig?.messageToSign || '',
        {
          resources: [new URL('https://' + oauthConfig.clientId).toString()],
        }
      )
      if (result) {
        onSuccess(result.signature, result.message)
      }
    }
  }

  return (
    <div className="bg-white z-10 shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation onClose={onClose} onBack={onBack} />
      <CheckoutHead />
      <header>
        <h1 className="text-xl text-center font-medium p-1">
          <span className="font-bold text-brand-ui-primary">
            {oauthConfig.clientId.length > 20
              ? oauthConfig.clientId.slice(0, 17) + '...'
              : oauthConfig.clientId}
          </span>{' '}
          wants you to sign in
        </h1>
        <div className="border-t"></div>
      </header>
      <div className="h-full mt-4 space-y-5">
        <ConnectWalletComponent onNext={onSignIn} />
      </div>
    </div>
  )
}
