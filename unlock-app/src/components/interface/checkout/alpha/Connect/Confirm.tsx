import React, { useState } from 'react'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiUser3Line as UserIcon } from 'react-icons/ri'
import { FaEthereum as EthereumIcon } from 'react-icons/fa'
import { OAuthConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { createMessageToSignIn } from '~/utils/oauth'
import { Connected } from '../Connected'
import { ConnectService } from './connectMachine'
import { CheckoutHead, CloseButton } from '../Shell'
import { PoweredByUnlock } from '../PoweredByUnlock'

interface Props {
  oauthConfig: OAuthConfig
  connectService: ConnectService
  injectedProvider: unknown
  onClose(params?: Record<string, string>): void
}

export function ConfirmConnect({
  injectedProvider,
  oauthConfig,
  connectService,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false)
  const { account, network = 1, signMessage, isUnlockAccount } = useAuth()
  const onSignIn = async () => {
    setLoading(true)
    try {
      const message = createMessageToSignIn({
        clientId: oauthConfig.clientId,
        statement: '',
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

      onClose({
        code,
        state: oauthConfig.state,
      })
    } catch (error) {
      if (error instanceof Error) {
        onClose({
          error: error.message,
        })
      }
    }
  }

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col h-[40vh]">
      <div className="flex items-center justify-end mt-4 mx-4">
        <CloseButton onClick={() => onClose()} />
      </div>
      <main className="p-6 overflow-auto h-full">
        <div className="space-y-4">
          <header>
            <h1 className="font-medium text-xl">
              <span className="font-bold text-brand-ui-primary">
                {oauthConfig.clientId}
              </span>{' '}
              wants you to sign in using your ethereum wallet.
            </h1>
          </header>
          <ol>
            <li className="flex gap-4 items-center">
              <UserIcon className="fill-brand-ui-primary" size={36} />
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
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
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
    </div>
  )
}
