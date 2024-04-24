import { ConnectService } from './connectMachine'
import { UnlockAccount } from '../main/UnlockAccount'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'

interface Props {
  connectService: ConnectService
}

export function UnlockAccountSignIn({ connectService }: Props) {
  return (
    <ConnectUnlockAccount
      onSignIn={() => {
        connectService.send({ type: 'CONNECT' })
      }}
      onExit={() => {
        connectService.send({ type: 'CONNECT' })
      }}
      useIcon={false}
    />
  )
}
