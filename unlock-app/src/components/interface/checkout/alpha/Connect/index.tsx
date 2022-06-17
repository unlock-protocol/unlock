import React from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './Confirm'
import { Shell } from '../Shell'
import { useMachine } from '@xstate/react'
import { connectMachine } from './connectMachine'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'

interface Props {
  oauthConfig: OAuthConfig
  injectedProvider: unknown
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function Connect({ injectedProvider, oauthConfig }: Props) {
  const [state, send] = useMachine(connectMachine)
  const onClose = (params: Record<string, string> = {}) => {
    const redirectURI = new URL(oauthConfig.redirectUri)
    for (const [key, value] of Object.entries(params)) {
      redirectURI.searchParams.append(key, value)
    }
    window.location.assign(redirectURI)
  }

  function Content() {
    switch (state.value) {
      case 'CONNECT': {
        return (
          <ConfirmConnect
            onClose={onClose}
            send={send}
            state={state}
            oauthConfig={oauthConfig}
            injectedProvider={injectedProvider}
          />
        )
      }
      case 'SIGN_IN': {
        return (
          <UnlockAccountSignIn
            state={state}
            send={send}
            injectedProvider={injectedProvider}
          />
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <Shell.Root
      onClose={() =>
        onClose({
          error: 'Closed unexpectedly',
        })
      }
    >
      <Content />
    </Shell.Root>
  )
}
