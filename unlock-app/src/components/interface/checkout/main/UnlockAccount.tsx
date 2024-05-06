import { useSelector } from '@xstate/react'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'
import { CheckoutService } from './checkoutMachine'

interface Props {
  checkoutService: CheckoutService
}

export function UnlockAccount({ checkoutService }: Props) {
  const stateValue = useSelector(checkoutService, (state) => state.value)

  switch (stateValue) {
    case 'UNLOCK_ACCOUNT': {
      return (
        // onSignIn and onExit represents different actions, in this case logic should be the same
        <ConnectUnlockAccount
          onSignIn={() => checkoutService.send({ type: 'CONNECT' })}
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
