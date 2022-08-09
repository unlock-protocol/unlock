import React, { useCallback, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './Confirm'
import { useActor, useInterpret } from '@xstate/react'
import { connectMachine } from './connectMachine'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { CheckoutTransition, TopNavigation } from '../Shell'

interface Props {
  oauthConfig: OAuthConfig
  injectedProvider: unknown
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Connect({ injectedProvider, oauthConfig }: Props) {
  const connectService = useInterpret(connectMachine)
  const [state] = useActor(connectService)
  const matched = state.value.toString()

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      const redirectURI = new URL(oauthConfig.redirectUri)
      for (const [key, value] of Object.entries(params)) {
        redirectURI.searchParams.append(key, value)
      }
      window.location.assign(redirectURI)
    },
    [oauthConfig.redirectUri]
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
      return () => connectService.send('BACK')
    }
    return undefined
  }, [state, connectService])

  const Content = useCallback(() => {
    switch (matched) {
      case 'CONNECT': {
        return (
          <ConfirmConnect
            onClose={onClose}
            connectService={connectService}
            oauthConfig={oauthConfig}
            injectedProvider={injectedProvider}
          />
        )
      }
      case 'SIGN_IN': {
        return (
          <UnlockAccountSignIn
            connectService={connectService}
            injectedProvider={injectedProvider}
          />
        )
      }
      default: {
        return null
      }
    }
  }, [matched, onClose, connectService, injectedProvider, oauthConfig])

  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[70vh] sm:h-[60vh] min-h-[24rem] max-h-[32rem]">
        <TopNavigation onClose={onClose} onBack={onBack} />
        <Content />
      </div>
    </CheckoutTransition>
  )
}
