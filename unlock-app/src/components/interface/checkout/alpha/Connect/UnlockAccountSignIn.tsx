import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
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
  return (
    <UnlockAccount
      unlockAccountService={
        state.children.unlockAccount as UnlockAccountService
      }
      injectedProvider={injectedProvider}
    />
  )
}
