import { useActor } from '@xstate/react'
import { Shell } from '../Shell'
import { UnlockAccount } from '../UnlockAccount'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { ConnectService } from './connectMachine'

interface Props {
  connectService: ConnectService
  injectedProvider: unknown
  onClose(params?: Record<string, string>): void
}

export function UnlockAccountSignIn({
  connectService,
  injectedProvider,
  onClose,
}: Props) {
  const [state] = useActor(connectService)
  return (
    <Shell.Root
      onClose={() =>
        onClose({
          error:
            'User closed window in middle of signing in with unlock account',
        })
      }
    >
      <UnlockAccount
        unlockAccountService={
          state.children.unlockAccount as UnlockAccountService
        }
        injectedProvider={injectedProvider}
      />
    </Shell.Root>
  )
}
