import React, { Fragment } from 'react'
import { ConnectedWallet } from '../../connect/ConnectedWallet'
import { ConnectWallet } from '../../connect/Wallet'
import { Button } from '@unlock-protocol/ui'
import { PoweredByUnlock } from '../PoweredByUnlock'

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
  return (
    <Fragment>
      <main className={style}>
        {connected ? (
          <ConnectedWallet showIcon={false} />
        ) : (
          <div className="h-full">
            <ConnectWallet
              onUnlockAccount={onUnlockAccount}
              injectedProvider={injectedProvider}
            />
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button disabled={!account} onClick={onNext}>
          Next
        </Button>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
