import { useActor } from '@xstate/react'
import { BackButton, CheckoutTransition, CloseButton } from '../Shell'
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
  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService
  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[70vh] sm:h-[60vh] max-h-[32rem]">
        <div className="flex items-center justify-between p-6">
          <BackButton onClick={() => unlockAccountService.send('BACK')} />
          <CloseButton
            onClick={() =>
              onClose({
                error: 'User did not sign in with unlock account',
              })
            }
          />
        </div>
        <UnlockAccount
          unlockAccountService={unlockAccountService}
          injectedProvider={injectedProvider}
        />
      </div>
    </CheckoutTransition>
  )
}
