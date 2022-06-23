import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const [state] = useActor(checkoutService)
  return (
    <UnlockAccount
      unlockAccountService={
        state.children.unlockAccount as UnlockAccountService
      }
      injectedProvider={injectedProvider}
    />
  )
}
