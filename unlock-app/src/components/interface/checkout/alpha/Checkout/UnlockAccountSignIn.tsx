import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const [state] = useActor(checkoutService)
  const [childState, childSend] = useActor(state.children.unlockAccount)
  return (
    <UnlockAccount
      state={childState}
      send={childSend}
      injectedProvider={injectedProvider}
    />
  )
}
