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
  const { account, isUnlockAccount } = useAuth()

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
      <main className="h-full px-6 pb-2 space-y-2 overflow-auto">
        <header>
          <h1 className="text-xl font-medium">
            <span className="font-bold text-brand-ui-primary">
              {oauthConfig.clientId}
            </span>{' '}
            wants you to sign in.
          </h1>
        </header>
        <ol>
          <li className="flex items-center gap-6">
            <div>
              <UserIcon className="fill-brand-ui-primary" size={36} />
            </div>
            {account && isUnlockAccount && (
              <div className="text-brand-gray">
                {oauthConfig.clientId} will be able to read all memberships
                associated with your Unlock account.
              </div>
            )}
            {account && !isUnlockAccount && (
              <div className="text-brand-gray">
                Read all transactions associated with your wallet
                <span className="m-1 font-medium text-brand-ui-primary p-0.5 border rounded border-brand-ui-primary">
                  {account.slice(0, 4)}...{account!.slice(-4)}
                </span>
              </div>
            )}
            {!account && (
              <div className="text-brand-gray">
                Please use your{' '}
                <a
                  className="underline"
                  target="_blank"
                  href="https://ethereum.org/en/wallets/"
                  rel="noreferrer noopener"
                >
                  crypto wallet
                </a>{' '}
                if you have one, or click the &quot;Get Started&quot; button to
                use an Unlock account.
              </div>
            )}
          </li>
        </ol>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          skipAccountDetails
          injectedProvider={injectedProvider}
          service={connectService}
        >
          <div className="flex gap-4">
            <Button
              onClick={onSignIn}
              loading={loading}
              disabled={loading || !account}
              className="w-1/2"
            >
              Accept
            </Button>
            <Button
              variant="outlined-primary"
              onClick={onCancel}
              disabled={!account}
              className="w-1/2"
            >
              Refuse
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
