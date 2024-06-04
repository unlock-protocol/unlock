import React, { Fragment } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { SelectConnectMethod } from '../../connect/SelectConnectMethod'
import { CheckoutService } from './checkoutMachine'

interface ConnectPageProps {
  style: string
  connected: string | undefined
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({
  style,
  connected,
  onNext,
  checkoutService,
}: ConnectPageProps) => {
  return (
    <Fragment>
      <main className={style}>
        <SelectConnectMethod
          shouldRedirect={false}
          connected={connected}
          onNext={onNext}
          checkoutService={checkoutService}
        />
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
