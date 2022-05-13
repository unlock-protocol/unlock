import React, { useState, ReactNode } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useConfig } from '~/utils/withConfig'
import { ConfirmConnect } from './Confirm'
import { Shell } from '../Shell'
import { SignInOrUp } from '../SignInOrUp'

interface Props {
  oauthConfig: OAuthConfig
  communication: ReturnType<typeof useCheckoutCommunication>
}

type ConnectStages = 'connect' | 'signin'

export function Connect({ oauthConfig, communication }: Props) {
  const [page, setStage] = useState<ConnectStages>('connect')
  const config = useConfig()
  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

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

  const views: Record<ConnectStages, ReactNode> = {
    connect: (
      <ConfirmConnect
        onClose={onClose}
        navigate={navigate}
        oauthConfig={oauthConfig}
        injectedProvider={injectedProvider}
      />
    ),
    signin: (
      <SignInOrUp
        injectedProvider={injectedProvider}
        onSignedIn={() => navigate('connect')}
      />
    ),
  }

  return (
    <Shell
      onClose={() =>
        onClose({
          error: 'Closed unexpectedly',
        })
      }
    >
      {views[page]}
    </Shell>
  )
}
