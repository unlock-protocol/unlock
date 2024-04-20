import { useSelector } from '@xstate/react'
import { UnlockAccountService } from './unlockAccountMachine'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'

interface Props {
  unlockAccountService: UnlockAccountService
  injectedProvider: unknown
}

export function UnlockAccount({ unlockAccountService }: Props) {
  const stateValue = useSelector(unlockAccountService, (state) => state.value)

  switch (stateValue) {
    case 'ACCOUNT': {
      return (
        <ConnectUnlockAccount
          onExit={() => unlockAccountService.send({ type: 'BACK' })}
          useIcon={false}
        />
      )
    }
    default: {
      return null
    }
  }
}
