import { useAuthenticate } from '~/hooks/useAuthenticate'
import SvgComponents from '../svg'
import { IoWalletOutline as WalletIcon } from 'react-icons/io5'
import { ConnectButton } from './Custom'

interface ConnectWalletProps {
  onUnlockAccount: () => void
}

export const ConnectWallet = ({ onUnlockAccount }: ConnectWalletProps) => {
  const { authenticateWithProvider } = useAuthenticate()
  return (
    <div className="space-y-6 divide-y divide-gray-100">
      <div className="grid gap-4 px-6">
        <ConnectButton
          icon={<SvgComponents.Metamask width={40} height={40} />}
          onClick={(event) => {
            event.preventDefault()
            authenticateWithProvider('METAMASK')
          }}
        >
          Metamask
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.WalletConnect width={40} height={40} />}
          onClick={(event) => {
            event.preventDefault()
            authenticateWithProvider('WALLET_CONNECT')
          }}
        >
          WalletConnect
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.CoinbaseWallet width={40} height={40} />}
          onClick={(event) => {
            event.preventDefault()
            authenticateWithProvider('COINBASE')
          }}
        >
          Coinbase Wallet
        </ConnectButton>
        <ConnectButton icon={<WalletIcon size={26} className="mr-2" />}>
          I don&apos;t have a wallet
        </ConnectButton>
      </div>
      <div className="grid gap-4 p-6">
        <div className="px-2 text-sm text-center text-gray-600">
          If you previously created an unlock account or do not have a wallet,
          use this option.
        </div>
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          onClick={(event) => {
            event.preventDefault()
            onUnlockAccount()
          }}
        >
          Unlock Account
        </ConnectButton>
      </div>
    </div>
  )
}
