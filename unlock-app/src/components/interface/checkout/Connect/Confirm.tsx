import React, { Fragment, useState } from 'react'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiUser3Line as UserIcon } from 'react-icons/ri'
import { FaEthereum as EthereumIcon } from 'react-icons/fa'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType as PaywallConfig } from '@unlock-protocol/core'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Connected } from '../Connected'
import { ConnectService } from './connectMachine'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'

interface Props {
  paywallConfig?: PaywallConfig
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
  const { siweSign } = useSIWE()
  const { account, isUnlockAccount } = useAuth()

  const onSignIn = async () => {
    try {
      setLoading(true)

      const result = await siweSign(
        generateNonce(),
        paywallConfig?.messageToSign || ''
      )

      if (result) {
        const { message, signature } = result
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
        setLoading(false)
      } else {
        setLoading(false)
      }
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
        <Connected injectedProvider={injectedProvider} service={connectService}>
          <Button
            onClick={onSignIn}
            disabled={loading || !account}
            loading={loading}
            iconLeft={<Icon icon={EthereumIcon} size="medium" key="ethereum" />}
            className="w-full"
          >
            {isUnlockAccount && 'Continue'}
            {!isUnlockAccount && (
              <>
                {loading && 'Please sign the message'}
                {!loading && 'Sign-in with Wallet'}
              </>
            )}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
