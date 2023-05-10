import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { Stepper } from '../Stepper'
import { Fragment } from 'react'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const unlockAccountService = checkoutService.state.children
    .unlockAccount as UnlockAccountService

  return (
    <Fragment>
      <div className="mb-2">
        <Stepper service={unlockAccountService} />
      </div>
      <UnlockAccount
        unlockAccountService={unlockAccountService}
        injectedProvider={injectedProvider}
      />
    </Fragment>
  )
}
