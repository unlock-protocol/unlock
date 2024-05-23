import React, { Fragment, useState } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { SelectConnectMethod } from '../../connect/SelectConnectMethod'

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
        <SelectConnectMethod connected={connected} onNext={onNext} />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
