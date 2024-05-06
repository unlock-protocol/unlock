import React, { useCallback, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './Confirm'
import { connectMachine } from './connectMachine'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { TopNavigation } from '../Shell'
import { useMachine } from '@xstate/react'

interface Props {
  oauthConfig: OAuthConfig
  injectedProvider: unknown
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Connect({
  injectedProvider,
  oauthConfig,
  communication,
}: Props) {
  // @ts-expect-error - The types returned by 'resolveState(...)' are incompatible between these types
  const [state, send, connectService] = useMachine(connectMachine)
  const matched = state.value.toString()

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

  const Content = useCallback(() => {
    switch (matched) {
      case 'CONNECT': {
        return (
          <ConfirmConnect
            communication={communication}
            onClose={onClose}
            connectService={connectService}
            oauthConfig={oauthConfig}
            injectedProvider={injectedProvider}
          />
        )
      }
      case 'SIGN_IN': {
        return <UnlockAccountSignIn connectService={connectService} />
      }
      default: {
        return null
      }
    }
  }, [matched, onClose, connectService, injectedProvider, oauthConfig])

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full gap-2 h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation onClose={onClose} onBack={onBack} />
      <header>
        <h1 className="text-xl text-center font-medium">
          <span className="font-bold text-brand-ui-primary">
            {oauthConfig.clientId}
          </span>{' '}
          wants you to sign in
        </h1>
      </header>
      <Content />
    </div>
  )
}
