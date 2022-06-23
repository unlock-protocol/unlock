import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { ConnectService } from './connectMachine'

interface Props {
  connectService: ConnectService
  injectedProvider: unknown
}

export function UnlockAccountSignIn({
  connectService,
  injectedProvider,
}: Props) {
  const [state] = useActor(connectService)
  const [childState, childSend] = useActor(state.children.unlockAccount)
  return (
    <UnlockAccount
      state={childState}
      send={childSend}
      injectedProvider={injectedProvider}
    />
  )
}
