import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { ConnectSend, ConnectState } from './connectMachine'

interface Props {
  state: ConnectState
  send: ConnectSend
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
