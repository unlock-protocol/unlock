import React, { useMemo, useState } from 'react'
import SvgComponents from './svg'
import { RiWalletFill as WalletIcon } from 'react-icons/ri'
import LogInSignUp from './LogInSignUp'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { SiBrave as BraveWalletIcon } from 'react-icons/si'
import { DownloadWallet } from '../interface/DownloadWallet'
import { Button } from '@unlock-protocol/ui'

interface LoginPromptProps {
  unlockUserAccount?: boolean
  onCancel?: () => void
  embedded?: boolean
  children?: React.ReactNode
  showTitle?: boolean
  backgroundColor?: string
  activeColor?: string
  injectedProvider?: any
}

export interface EthereumWindow extends Window {
  ethereum?: any
  web3?: any
}

const LoginPrompt = ({
  children,
  onCancel,
  injectedProvider,
  unlockUserAccount = false,
  embedded = false,
  showTitle = true,
}: LoginPromptProps) => {
  const [walletToShow, setWalletToShow] = useState('')
  const [isDownloadWallet, setIsDownloadWallet] = useState(false)

  const { authenticateWithProvider } = useAuthenticate({
    injectedProvider,
  })

  const ButtonIcon = useMemo(() => {
    const walletIcons = {
      metamask: <SvgComponents.Metamask width={32} />,
      brave: <BraveWalletIcon size={20} className="m-1.5" />,
      frame: <SvgComponents.Frame width={30} />,
      status: <SvgComponents.Status width={32} />,
      default: <WalletIcon size={20} className="m-1.5" />,
    }

    if (window.ethereum?.isMetaMask) {
      return walletIcons.metamask
    }

    // @ts-expect-error no typing
    if (window.ethereum?.isBraveWallet) {
      return walletIcons.brave
    }

    // @ts-expect-error no typing
    if (window.ethereum?.isFrame) {
      return walletIcons.frame
    }

    // @ts-expect-error no typing
    if (window.ethereum?.isStatus) {
      return walletIcons.status
    }

    return walletIcons.default
  }, [])

  const onInjectedHandler = () => {
    if (window.ethereum) {
      return authenticateWithProvider('METAMASK')
    }

    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/iPhone/i)
    ) {
      return authenticateWithProvider('WALLET_CONNECT')
    }

    setIsDownloadWallet(true)
  }

  const WalletButton = ({ title, icon, ...props }: any) => {
    return (
      <Button variant="secondary" {...props} className="justify-start">
        <div className="flex items-center justify-start gap-2">
          <div className="w-8 h-8">{icon}</div>
          <span>{title}</span>
        </div>
      </Button>
    )
  }

  return (
    <div
      className={`flex flex-col self-center mx-auto gap-4 ${
        !embedded ? 'w-96' : ''
      }`}
    >
      <DownloadWallet
        isOpen={isDownloadWallet}
        setIsOpen={setIsDownloadWallet}
      />
      {!walletToShow && (
        <>
          {showTitle && (
            <h2 className="text-3xl font-semibold">Connect a wallet</h2>
          )}

          {children}

          <WalletButton
            title="In browser wallet"
            icon={ButtonIcon}
            onClick={onInjectedHandler}
          />

          <WalletButton
            title="WalletConnect"
            onClick={() => authenticateWithProvider('WALLET_CONNECT')}
            icon={<SvgComponents.WalletConnect fill="var(--blue)" />}
          />

          <WalletButton
            title="Coinbase Wallet"
            onClick={() => authenticateWithProvider('COINBASE')}
            icon={<SvgComponents.CoinbaseWallet fill="var(--blue)" />}
          />

          {unlockUserAccount && (
            <WalletButton
              disabled={!unlockUserAccount}
              title="Unlock Account"
              icon={<SvgComponents.Unlock fill="var(--brand)" />}
              onClick={() => {
                setWalletToShow('unlock')
              }}
            />
          )}
        </>
      )}

      {walletToShow == 'unlock' && unlockUserAccount && (
        <LogInSignUp
          network={1} // default to mainnet?
          embedded={embedded}
          onCancel={onCancel}
          login
          useWallet={() => setWalletToShow('')}
        />
      )}
    </div>
  )
}

export default LoginPrompt
