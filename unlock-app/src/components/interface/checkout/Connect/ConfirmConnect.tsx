import React from 'react'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'

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

  const onConfirm = async () => {
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
    <h1 className="text-xl mt-4 px-4 font-medium">
      <span className="font-bold text-brand-ui-primary">
        {oauthConfig.clientId.length > 20
          ? oauthConfig.clientId.slice(0, 17) + '...'
          : oauthConfig.clientId}
      </span>{' '}
      wants you to sign in
    </h1>
  )
}
