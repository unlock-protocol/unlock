import { ConnectService } from './connectMachine'
import { ConnectUnlockAccount } from '../../connect/UnlockAccount'

interface Props {
  connectService: ConnectService
}

export function UnlockAccountSignIn({ connectService }: Props) {
  return (
    // onSignIn and onExit represents different actions, in this case logic should be the same
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
