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

type ConnectStages = 'connect' | 'signin'

export function Connect({
  injectedProvider,
  oauthConfig,
  communication,
}: Props) {
  const [page, setStage] = useState<ConnectStages>('connect')

  const navigate = (to: ConnectStages) => {
    setStage(to)
  }

  const onClose = (params: Record<string, string> = {}) => {
    const redirectURI = new URL(oauthConfig.redirectUri)
    for (const [key, value] of Object.entries(params)) {
      redirectURI.searchParams.append(key, value)
    }
    window.location.assign(redirectURI)
  }

  function Content() {
    switch (page) {
      case 'signin': {
        return (
          <SignInOrUp
            injectedProvider={injectedProvider}
            onSignedIn={() => navigate('connect')}
          />
        )
      }
      default: {
        return (
          <ConfirmConnect
            onClose={onClose}
            navigate={navigate}
            oauthConfig={oauthConfig}
            injectedProvider={injectedProvider}
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
