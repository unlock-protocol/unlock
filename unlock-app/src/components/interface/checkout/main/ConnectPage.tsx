import { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import ConnectWalletComponent from '../../connect/ConnectWalletComponent'
import { CheckoutService } from './checkoutMachine'

interface ConnectPageProps {
  style: string
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({ style }: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <ConnectWalletComponent />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
