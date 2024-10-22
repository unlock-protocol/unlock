import { CheckoutService } from './checkoutMachine'
import { ConnectWallet } from '../../connect/Wallet'

interface ConnectPageProps {
  style: string
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({ style }: ConnectPageProps) => {
  return (
    <main className={style}>
      <ConnectWallet />
    </main>
  )
}
