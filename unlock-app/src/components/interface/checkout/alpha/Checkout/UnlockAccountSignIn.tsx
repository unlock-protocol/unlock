import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutState, CheckoutSend } from './checkoutMachine'

interface Props {
  state: CheckoutState
  send: CheckoutSend
  injectedProvider: unknown
}

export function UnlockAccountSignIn({ state, injectedProvider }: Props) {
  const [childState, childSend] = useActor(state.children.unlockAccount)
  return (
    <UnlockAccount
      state={childState}
      send={childSend}
      injectedProvider={injectedProvider}
    />
  )
}
