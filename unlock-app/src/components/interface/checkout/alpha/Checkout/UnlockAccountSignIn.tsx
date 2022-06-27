import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { Shell } from '../Shell'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
  const [state] = useActor(checkoutService)
  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
      <UnlockAccount
        unlockAccountService={
          state.children.unlockAccount as UnlockAccountService
        }
        injectedProvider={injectedProvider}
      />
    </Shell.Root>
  )
}
