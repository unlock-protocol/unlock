import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectedWallet } from './ConnectedWallet'
import { ConnectWallet } from './Wallet'
import { CheckoutService } from '../checkout/main/checkoutMachine'

interface ConnectWalletComponentProps {
  onNext?: () => void
  checkoutService?: CheckoutService
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
