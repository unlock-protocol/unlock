import { UnlockAccount } from './UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { Stepper } from '../Stepper'
import { Fragment } from 'react'
interface Props {
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({ checkoutService }: Props) {
  return (
    <Fragment>
      <div className="mb-2">
        <Stepper service={checkoutService} isUnlockAccount={true} />
      </div>
      <UnlockAccount checkoutService={checkoutService} />
    </Fragment>
  )
}
