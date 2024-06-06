import React, { Fragment } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { PoweredByUnlock } from '../PoweredByUnlock'

interface ConnectPageProps {
  style: string
  connected: string | undefined
  onNext?: () => void
}

export const ConnectPage = ({ style, connected, onNext }: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        {!connected && <ConnectWallet />}
        {connected && <ConnectedWallet onNext={onNext} />}
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
