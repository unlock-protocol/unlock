import React, { Fragment, useState } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { useSIWE } from '~/hooks/useSIWE'

interface ConnectPageProps {
  style: string
  connected: string | undefined
  onNext?: () => void
}

export const ConnectPage = ({ style, connected, onNext }: ConnectPageProps) => {
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
        {connected && <ConnectedWallet showIcon={false} onNext={onNext} />}
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
