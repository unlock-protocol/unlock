import { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { CheckoutService } from './checkoutMachine'
import { ConnectWallet } from '../../connect/Wallet'

interface ConnectPageProps {
  style: string
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({ style }: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <ConnectWallet />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
