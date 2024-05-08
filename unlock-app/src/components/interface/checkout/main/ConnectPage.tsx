import React, { Fragment, useState } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useConnectModal } from '~/hooks/useConnectModal'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { useAuth } from '~/contexts/AuthenticationContext'

interface ConnectPageProps {
  style: string
  onUnlockAccount: () => void
  onNext: () => void
  injectedProvider: unknown
  connected: string | undefined
  account: string | undefined
}

export const ConnectPage = ({
  style,
  onUnlockAccount,
  onNext,
  injectedProvider,
  connected,
  account,
}: ConnectPageProps) => {
  const [email, setEmail] = useState('')
  const [useUnlockAccount, setUseUnlockAccount] = useState(false)

  return (
    <Fragment>
      <main className={style}>
        {!useUnlockAccount && !connected && (
          <ConnectWallet
            onUnlockAccount={(email) => {
              setEmail(email || '') // Assign an empty string if email is undefined
              setUseUnlockAccount(true)
            }}
          />
        )}
        {useUnlockAccount && !connected && (
          <ConnectUnlockAccount
            defaultEmail={email}
            useIcon={false}
            onExit={() => {
              setEmail('')
              setUseUnlockAccount(false)
            }}
          />
        )}
        {connected && <ConnectedWallet />}
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
