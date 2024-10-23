import { CheckoutService } from './checkoutMachine'
import { LoginModal } from '@privy-io/react-auth'

interface ConnectPageProps {
  style: string
  onNext?: () => void
  checkoutService?: CheckoutService
}

export const ConnectPage = ({ style }: ConnectPageProps) => {
  return (
    <main className={style}>
      <LoginModal open={true} />
    </main>
  )
}
