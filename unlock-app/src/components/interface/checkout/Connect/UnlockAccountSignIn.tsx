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
  const unlockAccount = useSelector(
    connectService,
    (state) => state.children.unlockAccount
  )
  return (
    <UnlockAccount
      unlockAccountService={unlockAccount as UnlockAccountService}
      injectedProvider={injectedProvider}
    />
  )
}
