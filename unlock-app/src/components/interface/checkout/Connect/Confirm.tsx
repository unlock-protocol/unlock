import React, { Fragment, useState } from 'react'
import { Button } from '@unlock-protocol/ui'
import { RiUser3Line as UserIcon } from 'react-icons/ri'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Connected } from '../Connected'
import { ConnectService } from './connectMachine'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'

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
  const [loading, setLoading] = useState(false)
  const { siweSign, signature, message } = useSIWE()
  const { account, connected, isUnlockAccount } = useAuth()

  const onCancel = async () => {
    onClose({
      error: 'access-denied',
      state: oauthConfig.state,
    })
  }

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
    setLoading(true)
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
    setLoading(false)
  }

  return (
    <Fragment>
      <main className="h-full px-6 py-2 pb-2 space-y-5 gap-2 overflow-hidden">
        {connected ? (
          <ConnectedWallet showIcon={false} />
        ) : (
          <div className="h-full">
            <ConnectWallet
              onUnlockAccount={() => {
                connectService.send({ type: 'UNLOCK_ACCOUNT' })
                console.log(connectService)
              }}
              injectedProvider={injectedProvider}
            />
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button
          disabled={!account}
          onClick={async (event) => {
            event.preventDefault()

            onSignIn()
          }}
        >
          Next
        </Button>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
