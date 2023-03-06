import {
  RECENTLY_USED_PROVIDER,
  useAuthenticate,
} from '~/hooks/useAuthenticate'
import SvgComponents from '../svg'
import { IoWalletOutline as WalletIcon } from 'react-icons/io5'
import { ConnectButton, CustomAnchorButton } from './Custom'
import { useLocalStorage } from '@rehooks/local-storage'
import { MouseEventHandler, useState } from 'react'
interface ConnectWalletProps {
  onUnlockAccount: () => void
}

export const ConnectWallet = ({ onUnlockAccount }: ConnectWalletProps) => {
  const { authenticateWithProvider } = useAuthenticate()
  const [recentlyUsedProvider] = useLocalStorage(RECENTLY_USED_PROVIDER, null)
  const [isConnecting, setIsConnecting] = useState('')

  const createOnConnectHandler = (provider: any) => {
    const handler: MouseEventHandler<HTMLButtonElement> = async (event) => {
      event.preventDefault()
      setIsConnecting(provider)
      await authenticateWithProvider(provider)
      setIsConnecting('')
    }
    return handler
  }

  return (
    <div className="space-y-6 divide-y divide-gray-100">
      <div className="grid gap-4 px-6">
        <ConnectButton
          icon={<SvgComponents.Metamask width={40} height={40} />}
          highlight={recentlyUsedProvider === 'METAMASK'}
          loading={isConnecting === 'METAMASK'}
          onClick={createOnConnectHandler('METAMASK')}
        >
          Metamask
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.WalletConnect width={40} height={40} />}
          highlight={recentlyUsedProvider === 'WALLET_CONNECT'}
          loading={isConnecting === 'WALLET_CONNECT'}
          onClick={createOnConnectHandler('WALLET_CONNECT')}
        >
          WalletConnect
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.CoinbaseWallet width={40} height={40} />}
          highlight={recentlyUsedProvider === 'COINBASE'}
          loading={isConnecting === 'COINBASE'}
          onClick={createOnConnectHandler('COINBASE')}
        >
          Coinbase Wallet
        </ConnectButton>
        <CustomAnchorButton
          target="_blank"
          rel="noopener noreferrer"
          href="https://ethereum.org/en/wallets/find-wallet/"
        >
          I don&apos;t have a wallet
          <WalletIcon size={26} className="mr-2" />
        </CustomAnchorButton>
      </div>
      <div className="grid gap-4 p-6">
        <div className="px-2 text-sm text-center text-gray-600">
          If you previously created an unlock account or do not have a wallet,
          use this option.
        </div>
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          highlight={recentlyUsedProvider === 'UNLOCK'}
          loading={isConnecting === 'UNLOCK'}
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
