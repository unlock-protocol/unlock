import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { Stepper } from '../Stepper'
import { Fragment } from 'react'
import { useActor, useSelector } from '@xstate/reactv4'
import { s } from 'vitest/dist/types-198fd1d9'
import { ActorRef } from 'xsatev5'
interface Props {
  injectedProvider: unknown
  checkoutService: ActorRef<any, any>
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const state = useSelector(checkoutService, (state) => state)
  const unlockAccountService = state.children
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
