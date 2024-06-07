import React, { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import ConnectWalletComponent from '../../connect/ConnectWalletComponent'

interface ConnectPageProps {
  style: string
  connected: string | undefined
  onNext?: () => void
}

export const ConnectPage = ({ style, onNext }: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <ConnectWalletComponent onNext={onNext} />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
