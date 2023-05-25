import { Button, Tooltip } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { addressMinify, minifyEmail } from '~/utils/strings'
import SvgComponents from '../svg'
import { CheckoutService } from './main/checkoutMachine'
import { ConnectService } from './Connect/connectMachine'
import { SiBrave as BraveWalletIcon } from 'react-icons/si'
import { DownloadWallet } from '../DownloadWallet'
import { detectInjectedProvider } from '~/utils/wallet'
import { useSIWE } from '~/hooks/useSIWE'
interface SignedInProps {
  onDisconnect?: () => void
  isUnlockAccount: boolean
  email?: string
  account?: string
  isDisconnecting?: boolean
}

export function SignedIn({
  onDisconnect,
  isUnlockAccount,
  email,
  account,
  isDisconnecting,
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
        side="top"
        tip={`${
          isUnlockAccount ? 'Signing out' : 'Disconnecting'
        } will reset the flow`}
      >
        {onDisconnect && (
          <Button
            variant="borderless"
            size="small"
            loading={isDisconnecting}
            onClick={onDisconnect}
            type="button"
          >
            {signOutText}
          </Button>
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
  title?: string
}

export function SignedOut({
  onUnlockAccount,
  authenticateWithProvider,
  injectedProvider,
  title = 'Have a crypto wallet?',
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
    }
    const detected = detectInjectedProvider(injectedProvider)
    return walletIcons[detected]
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
        <h4 className="text-sm">{title}</h4>
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
        <h4 className="text-sm">No crypto wallet?</h4>
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
  const { account, email, isUnlockAccount, deAuthenticate, connected } =
    useAuth()
  const [signing, setSigning] = useState(false)

  const { authenticateWithProvider } = useAuthenticate({
    injectedProvider,
  })
  const { signIn, signOut, isSignedIn } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const autoconnect = state.context?.paywallConfig?.autoconnect

  useEffect(() => {
    const autoSignIn = async () => {
      if (
        !isSignedIn &&
        !signing &&
        connected &&
        (isUnlockAccount || autoconnect)
      ) {
        setSigning(true)
        await signIn()
        setSigning(false)
      }
    }
    autoSignIn()
  }, [connected, autoconnect, isUnlockAccount, signIn, signing, isSignedIn])

  // Autoconnect
  useEffect(() => {
    if (autoconnect) {
      console.debug('Autoconnecting...')
      authenticateWithProvider('METAMASK')
    }
  }, [autoconnect, authenticateWithProvider])

  useEffect(() => {
    if (!account) {
      console.debug('Not connected')
    } else console.debug(`Connected as ${account}`)
  }, [account])

  if (autoconnect) {
    if (account) {
      return <div className="space-y-2">{children}</div>
    } else {
      console.debug('Autoconnect failed...')
      return null
    }
  }

  const onDisconnect = async () => {
    setIsDisconnecting(true)
    await signOut()
    await deAuthenticate()
    send('DISCONNECT')
    setIsDisconnecting(false)
  }

  return account ? (
    <div className="space-y-2">
      {children}
      <SignedIn
        isDisconnecting={isDisconnecting}
        account={account}
        email={email}
        isUnlockAccount={!!isUnlockAccount}
        onDisconnect={state.can('DISCONNECT') ? onDisconnect : undefined}
      />
    </div>
  ) : connected ? (
    <div className="grid">
      <Button
        loading={status === 'loading'}
        onClick={(event) => {
          event.preventDefault()
          signIn()
        }}
      >
        Sign message to Continue
      </Button>
    </div>
  ) : (
    <div>
      <SignedOut
        injectedProvider={injectedProvider}
        onUnlockAccount={() => {
          send('UNLOCK_ACCOUNT')
        }}
        authenticateWithProvider={authenticateWithProvider}
        title="Have a crypto wallet?"
      />
    </div>
  )
}
