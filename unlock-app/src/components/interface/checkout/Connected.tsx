import { Button, Tooltip } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { ReactNode, useMemo, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { addressMinify, minifyEmail } from '~/utils/strings'
import SvgComponents from '../svg'
import { CheckoutService } from './main/checkoutMachine'
import { ConnectService } from './Connect/connectMachine'
import { RiWalletFill as WalletIcon } from 'react-icons/ri'
import { SiBrave as BraveWalletIcon } from 'react-icons/si'
import { DownloadWallet } from '../DownloadWallet'
interface SignedInProps {
  onDisconnect?: () => void
  isUnlockAccount: boolean
  email?: string
  account?: string
}

export function SignedIn({
  onDisconnect,
  isUnlockAccount,
  email,
  account,
}: SignedInProps) {
  let userText: string
  let signOutText: string

  if (isUnlockAccount && email) {
    userText = `User: ${minifyEmail(email)}`
    signOutText = 'Sign out'
  } else {
    userText = `Wallet: ${addressMinify(account!)}`
    signOutText = 'Disconnect'
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <p> {userText}</p>
      <Tooltip
        delay={50}
        side="top"
        tip={`${
          isUnlockAccount ? 'Signing out' : 'Disconnecting'
        } will reset the flow`}
      >
        {onDisconnect && (
          <button
            className="font-medium text-gray-600 hover:text-black"
            onClick={onDisconnect}
            type="button"
          >
            {signOutText}
          </button>
        )}
      </Tooltip>
    </div>
  )
}

interface SignedOutProps {
  authenticateWithProvider(
    provider: 'METAMASK' | 'UNLOCK' | 'WALLET_CONNECT' | 'COINBASE'
  ): Promise<void>
  onUnlockAccount(): void
  injectedProvider: any
}

export function SignedOut({
  onUnlockAccount,
  authenticateWithProvider,
  injectedProvider,
}: SignedOutProps) {
  const iconButtonClass =
    'inline-flex items-center w-10 h-10 justify-center hover:[box-shadow:_0px_4px_15px_rgba(0,0,0,0.08)] [box-shadow:_0px_8px_30px_rgba(0,0,0,0.08)] rounded-full'
  const [isDownloadWallet, setIsDownloadWallet] = useState(false)

  const ButtonIcon = useMemo(() => {
    const walletIcons = {
      metamask: <SvgComponents.Metamask width={32} />,
      brave: <BraveWalletIcon size={20} className="m-1.5" />,
      frame: <SvgComponents.Frame width={24} />,
      status: <SvgComponents.Status width={32} />,
      default: <WalletIcon size={20} className="m-1.5" />,
    }

    if (injectedProvider?.isMetaMask) {
      return walletIcons.metamask
    }

    if (injectedProvider?.isBraveWallet) {
      return walletIcons.brave
    }

    if (injectedProvider?.isFrame) {
      return walletIcons.frame
    }

    if (injectedProvider?.isStatus) {
      return walletIcons.status
    }

    return walletIcons.default
  }, [injectedProvider])

  const onInjectedHandler = () => {
    if (injectedProvider) {
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

  return (
    <div className="grid w-full grid-flow-col grid-cols-11">
      <div className="grid items-center col-span-5 space-y-2 justify-items-center">
        <h4 className="text-sm"> Have a crypto wallet? </h4>
        <DownloadWallet
          isOpen={isDownloadWallet}
          setIsOpen={setIsDownloadWallet}
        />
        <div className="flex items-center justify-around w-full">
          <button
            aria-label="injected wallet"
            onClick={onInjectedHandler}
            type="button"
            className={iconButtonClass}
          >
            {ButtonIcon}
          </button>
          <button
            aria-label="wallet connect"
            onClick={() => authenticateWithProvider('WALLET_CONNECT')}
            type="button"
            className={iconButtonClass}
          >
            <SvgComponents.WalletConnect width={32} />
          </button>
          <button
            aria-label="coinbase wallet"
            onClick={() => authenticateWithProvider('COINBASE')}
            type="button"
            className={iconButtonClass}
          >
            <SvgComponents.CoinbaseWallet width={32} />
          </button>
        </div>
      </div>
      <div className="flex justify-center col-span-1">
        <div className="h-full border-l"></div>
      </div>
      <div className="grid items-center col-span-5 space-y-2 justify-items-center">
        <h4 className="text-sm"> Don&apos;t have a crypto wallet? </h4>
        <Button
          onClick={(event) => {
            event.preventDefault()
            onUnlockAccount()
          }}
          size="small"
          variant="outlined-primary"
          className="w-full"
        >
          Get started
        </Button>
      </div>
    </div>
  )
}

interface ConnectedCheckoutProps {
  injectedProvider?: unknown
  service: CheckoutService | ConnectService
  children?: ReactNode
}

export function Connected({
  service,
  injectedProvider,
  children,
}: ConnectedCheckoutProps) {
  const [state, send] = useActor<CheckoutService>(service as CheckoutService)
  const { account, email, isUnlockAccount, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticate({
    injectedProvider,
  })

  if (state.context.paywallConfig?.autoconnect) {
    return <div className="space-y-2">{children}</div>
  }

  const onDisconnect = () => {
    send('DISCONNECT')
    deAuthenticate()
  }
  return account ? (
    <div className="space-y-2">
      {children}
      <SignedIn
        account={account}
        email={email}
        isUnlockAccount={!!isUnlockAccount}
        onDisconnect={state.can('DISCONNECT') ? onDisconnect : undefined}
      />
    </div>
  ) : (
    <div>
      <SignedOut
        injectedProvider={injectedProvider}
        onUnlockAccount={() => {
          send('UNLOCK_ACCOUNT')
        }}
        authenticateWithProvider={authenticateWithProvider}
      />
    </div>
  )
}
