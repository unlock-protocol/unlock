import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectedWallet } from './ConnectedWallet'
import { ConnectWallet } from './Wallet'
import { CheckoutService } from '../checkout/main/checkoutMachine'
import { useSIWE } from '~/hooks/useSIWE'
import { useSession } from 'next-auth/react'
import ConnectingWaas from './ConnectingWaas'

interface ConnectWalletComponentProps {
  onNext?: () => void
  checkoutService?: CheckoutService
  shoudOpenConnectModal?: boolean
}

const ConnectWalletComponent = ({
  onNext,
  checkoutService,
  shoudOpenConnectModal = false,
}: ConnectWalletComponentProps) => {
  const { account, connected } = useAuth()
  const { isSignedIn } = useSIWE()

  const { data: session } = useSession()
  console.log('ConnectWalletComponent', session)
  const isLoadingWaas = session && (!connected || !isSignedIn || account === '')

  if (isLoadingWaas) {
    return <ConnectingWaas />
  }

  return (
    <div>
      {!connected && (
        <ConnectWallet
          shoudOpenConnectModal={shoudOpenConnectModal}
          checkoutService={checkoutService}
        />
      )}
      {connected && <ConnectedWallet onNext={onNext} />}
    </div>
  )
}

export default ConnectWalletComponent
