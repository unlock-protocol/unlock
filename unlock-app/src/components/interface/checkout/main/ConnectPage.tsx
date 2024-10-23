import { CheckoutService } from './checkoutMachine'
import { LoginModal } from '@privy-io/react-auth'

interface ConnectPageProps {
  style: string
  checkoutService?: CheckoutService
  showPrivyModal: boolean
}

export const ConnectPage = ({ style, showPrivyModal }: ConnectPageProps) => {
  return (
    <main className={style}>
      <LoginModal open={showPrivyModal} />
    </main>
  )
}
