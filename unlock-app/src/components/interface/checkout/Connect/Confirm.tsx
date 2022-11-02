import React, { Fragment, useState } from 'react'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiUser3Line as UserIcon } from 'react-icons/ri'
import { FaEthereum as EthereumIcon } from 'react-icons/fa'
import { OAuthConfig, PaywallConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { createMessageToSignIn } from '~/utils/oauth'
import { Connected } from '../Connected'
import { ConnectService } from './connectMachine'
import { PoweredByUnlock } from '../PoweredByUnlock'

interface Props {
  paywallConfig?: PaywallConfig
  oauthConfig: OAuthConfig
  connectService: ConnectService
  injectedProvider: unknown
  onClose(params?: Record<string, string>): void
}

export function ConfirmConnect({
  injectedProvider,
  oauthConfig,
  connectService,
  paywallConfig,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false)
  const { account, network = 1, signMessage, isUnlockAccount } = useAuth()
  const onSignIn = async () => {
    try {
      setLoading(true)
      const message = createMessageToSignIn({
        clientId: oauthConfig.clientId,
        statement: paywallConfig?.messageToSign || '',
        address: account!,
        chainId: network,
      })

      const signature = await signMessage(message)
      const code = Buffer.from(
        JSON.stringify({
          d: message,
          s: signature,
        })
      ).toString('base64')
      setLoading(false)
      onClose({
        code,
        state: oauthConfig.state,
      })
    } catch (error: any) {
      setLoading(false)
      console.error(error)
    }
  }

  return (
    <Fragment>
      <main className="h-full px-6 pb-2 space-y-2 overflow-auto">
        <header>
          <h1 className="text-xl font-medium">
            <span className="font-bold text-brand-ui-primary">
              {oauthConfig.clientId}
            </span>{' '}
            wants you to sign in using your ethereum wallet.
          </h1>
        </header>
        <ol>
          <li className="flex items-center gap-6">
            <div>
              <UserIcon className="fill-brand-ui-primary" size={36} />
            </div>
            <div className="text-brand-gray">
              Read all transactions associated with{' '}
              <span className="font-medium text-brand-ui-primary p-0.5 border rounded border-brand-ui-primary">
                {account
                  ? `${account.slice(0, 4)}...${account!.slice(-4)}`
                  : 'address'}
              </span>
            </div>
          </li>
        </ol>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected injectedProvider={injectedProvider} service={connectService}>
          <Button
            onClick={onSignIn}
            disabled={loading || !account}
            loading={loading}
            iconLeft={<Icon icon={EthereumIcon} size="medium" key="ethereum" />}
            className="w-full"
          >
            {loading && !isUnlockAccount
              ? 'Please sign the message'
              : 'Sign-in with Ethereum'}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
