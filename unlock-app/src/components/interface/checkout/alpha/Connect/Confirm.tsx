import React, { useState } from 'react'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiUser3Line as UserIcon } from 'react-icons/ri'
import { FaEthereum as EthereumIcon } from 'react-icons/fa'
import { OAuthConfig } from '~/unlockTypes'
import { useAuth } from '~/contexts/AuthenticationContext'
import { createMessageToSignIn } from '~/utils/oauth'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { Connected } from '../Connected'
import { ConnectSend, ConnectState } from './connectMachine'

interface Props {
  oauthConfig: OAuthConfig
  state: ConnectState
  send: ConnectSend
  injectedProvider: unknown
  onClose(params?: Record<string, string>): void
}

export function ConfirmConnect({
  injectedProvider,
  oauthConfig,
  onClose,
  send,
}: Props) {
  const [loading, setLoading] = useState(false)
  const { account, network = 1, signMessage, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
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
    <div>
      <main className="p-6 overflow-auto">
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
        <div className="mt-6">
          <Button
            onClick={onSignIn}
            disabled={loading || !account}
            loading={loading}
            iconLeft={<Icon icon={EthereumIcon} size="medium" />}
            className="w-full"
          >
            {loading ? 'Please sign the message' : 'Sign-in with Ethereum'}
          </Button>
        </div>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          account={account}
          onUnlockAccount={() => {
            send('SIGN_IN_USING_UNLOCK_ACCOUNT')
          }}
          onDisconnect={() => {
            deAuthenticate()
          }}
          authenticateWithProvider={authenticateWithProvider}
        />
      </footer>
    </div>
  )
}
