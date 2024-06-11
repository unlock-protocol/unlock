import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectedWallet } from './ConnectedWallet'
import { ConnectWallet } from './Wallet'
import { CheckoutService } from '../checkout/main/checkoutMachine'

interface ConnectWalletComponentProps {
  onNext?: () => void
  shouldRedirect?: boolean
  checkoutService?: CheckoutService
}

const ConnectWalletComponent = ({
  onNext,
  shouldRedirect = true,
  checkoutService,
}: ConnectWalletComponentProps) => {
  const { connected } = useAuth()

  return (
    <div>
      {!connected && (
        <ConnectWallet
          shouldRedirect={shouldRedirect}
          checkoutService={checkoutService}
        />
      )}
      {connected && <ConnectedWallet onNext={onNext} />}
    </div>
  )
}

export default ConnectWalletComponent
