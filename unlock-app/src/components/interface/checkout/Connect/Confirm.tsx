import React from 'react'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'
import { ConnectPage } from '../main/ConnectPage'

interface Props {
  paywallConfig?: PaywallConfigType
  oauthConfig: OAuthConfig
  onClose(params?: Record<string, string>): void
  communication: ReturnType<typeof useCheckoutCommunication>
}

export function ConfirmConnect({
  oauthConfig,
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
      style="h-full mt-4 space-y-5"
      connected={connected}
      onNext={onSignIn}
    />
  )
}
