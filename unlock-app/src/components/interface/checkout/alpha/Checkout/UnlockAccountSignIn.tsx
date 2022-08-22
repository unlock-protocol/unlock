import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { Step, StepFinish, Stepper } from '../Progress'
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

  const [state] = useActor(unlockAccountService)
  return (
    <Fragment>
      <div className="mb-2">
        <Stepper
          position={state.value === 'ENTER_EMAIL' ? 1 : 2}
          service={unlockAccountService}
          items={[
            {
              id: 1,
              name: 'Enter email',
              to: 'ENTER_EMAIL',
            },
            {
              id: 2,
              name: 'Password',
            },
            {
              id: 3,
              name: 'Signed in',
            },
          ]}
        />
      </div>

      <UnlockAccount
        unlockAccountService={unlockAccountService}
        injectedProvider={injectedProvider}
      />
    </Fragment>
  )
}
