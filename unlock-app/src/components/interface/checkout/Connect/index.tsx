import React, { useCallback, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './Confirm'
import { connectMachine } from './connectMachine'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { TopNavigation } from '../Shell'
import { useSelector } from '@xstate/react'
import { createActor } from 'xstate'

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
  const connectService = createActor(connectMachine).start()
  const state = useSelector(connectService, (state) => state)
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
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[70vh] sm:h-[60vh] min-h-[24rem] max-h-[32rem]">
      <TopNavigation onClose={onClose} onBack={onBack} />
      <Content />
    </div>
  )
}
