import React, { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import ConnectWalletComponent from '../../connect/ConnectWalletComponent'
import { CheckoutService } from './checkoutMachine'

interface ConnectPageProps {
  style: string
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({
  style,
  onNext,
  checkoutService,
}: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <ConnectWalletComponent
          onNext={onNext}
          checkoutService={checkoutService}
          shouldRedirect={false}
        />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
