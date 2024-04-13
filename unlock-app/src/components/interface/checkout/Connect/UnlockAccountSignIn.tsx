import { useSelector } from '@xstate/react'
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
  const state = useSelector(connectService, (state) => state)
  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService
  return (
    <UnlockAccount
      unlockAccountService={unlockAccountService}
      injectedProvider={injectedProvider}
    />
  )
}
