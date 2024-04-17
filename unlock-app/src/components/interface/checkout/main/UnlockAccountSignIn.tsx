import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { Stepper } from '../Stepper'
import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const unlockAccountService = useSelector(
    checkoutService,
    (state) => state.children.unlockAccount
  )
  return (
    <Fragment>
      <div className="mb-2">
        <Stepper service={unlockAccountService} />
      </div>
      <UnlockAccount
        unlockAccountService={unlockAccountService as UnlockAccountService}
        injectedProvider={injectedProvider}
      />
    </Fragment>
  )
}
