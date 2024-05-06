import React from 'react'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectService } from './connectMachine'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'
import { ConnectPage } from '../main/ConnectPage'

interface Props {
  paywallConfig?: PaywallConfigType
  oauthConfig: OAuthConfig
  connectService: ConnectService
  injectedProvider: unknown
  onClose(params?: Record<string, string>): void
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function ConfirmConnect({
  injectedProvider,
  oauthConfig,
  connectService,
  paywallConfig,
  onClose,
  communication,
}: Props) {
  const { siweSign, signature, message } = useSIWE()
  const { account, connected } = useAuth()

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
    <ConnectPage
      style="h-full px-6 py-2 pb-2 space-y-5 gap-2 overflow-hidden"
      onUnlockAccount={() => {
        connectService.send({ type: 'UNLOCK_ACCOUNT' })
      }}
      onNext={onSignIn}
      account={account}
      connected={connected}
      injectedProvider={injectedProvider}
    />
  )
}
