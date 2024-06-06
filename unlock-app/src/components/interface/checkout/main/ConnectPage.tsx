import React, { Fragment, useState } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { useAuth } from '~/contexts/AuthenticationContext'

interface ConnectPageProps {
  style: string
  onNext?: () => void
}

export const ConnectPage = ({ style, onNext }: ConnectPageProps) => {
  const [email, setEmail] = useState('')
  const [useUnlockAccount, setUseUnlockAccount] = useState(false)
  const { connected } = useAuth()

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
