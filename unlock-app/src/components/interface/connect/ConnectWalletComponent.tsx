import { ConnectWallet } from './Wallet'
import { CheckoutService } from '../checkout/main/checkoutMachine'

interface ConnectWalletComponentProps {
  onNext?: () => void
  checkoutService?: CheckoutService
}

const ConnectWalletComponent = () => {
  return (
    <div>
      <ConnectWallet />
    </div>
  )
}

export default ConnectWalletComponent
