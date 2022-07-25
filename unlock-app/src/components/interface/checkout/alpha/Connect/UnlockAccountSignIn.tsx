import { useActor } from '@xstate/react'
import { CheckoutHead, CloseButton } from '../Shell'
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
    <div className="bg-white max-w-md rounded-xl flex flex-col h-[40vh]">
      <div className="flex items-center justify-end mt-4 mx-4">
        <CloseButton
          onClick={() =>
            onClose({
              error: 'User did not sign in with unlock account',
            })
          }
        />
      </div>
      <UnlockAccount
        unlockAccountService={
          state.children.unlockAccount as UnlockAccountService
        }
        injectedProvider={injectedProvider}
      />
    </div>
  )
}
