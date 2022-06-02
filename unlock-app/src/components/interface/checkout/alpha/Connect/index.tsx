import React, { useState } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './Confirm'
import { Shell } from '../Shell'
import { SignInOrUp } from '../SignInOrUp'

interface Props {
  oauthConfig: OAuthConfig
  injectedProvider: unknown
  communication: ReturnType<typeof useCheckoutCommunication>
}

type ConnectState = 'connect' | 'signInOrUp'

export function Connect({ injectedProvider, oauthConfig }: Props) {
  const [state, setState] = useState<ConnectState>('connect')

  const onClose = (params: Record<string, string> = {}) => {
    const redirectURI = new URL(oauthConfig.redirectUri)
    for (const [key, value] of Object.entries(params)) {
      redirectURI.searchParams.append(key, value)
    }
    window.location.assign(redirectURI)
  }

  function Content() {
    switch (state) {
      case 'connect': {
        return (
          <ConfirmConnect
            onClose={onClose}
            onUnlockAccount={() => setState('signInOrUp')}
            oauthConfig={oauthConfig}
            injectedProvider={injectedProvider}
          />
        )
      }
      case 'signInOrUp': {
        return (
          <SignInOrUp
            injectedProvider={injectedProvider}
            onSignedIn={() => setState('connect')}
          />
        )
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
