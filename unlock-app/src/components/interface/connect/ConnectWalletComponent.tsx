import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectedWallet } from './ConnectedWallet'
import { ConnectWallet } from './Wallet'

interface ConnectWalletComponentProps {
  onNext?: () => void
}

const ConnectWalletComponent = ({ onNext }: ConnectWalletComponentProps) => {
  const { connected } = useAuth()

  return (
    <div>
      {!connected && <ConnectWallet />}
      {connected && <ConnectedWallet onNext={onNext} />}
    </div>
  )
}

export default ConnectWalletComponent
