import { useSelector } from '@xstate/react'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { CheckoutService } from './checkoutMachine'

interface Props {
  checkoutService: CheckoutService
  injectedProvider: unknown
}

export function UnlockAccount({ checkoutService }: Props) {
  const stateValue = useSelector(checkoutService, (state) => state.value)

  switch (stateValue) {
    case 'UNLOCK_ACCOUNT': {
      return (
        <ConnectUnlockAccount
          onExit={() => checkoutService.send({ type: 'CONNECT' })}
          useIcon={false}
        />
      )
    }
    default: {
      return null
    }
  }
}
