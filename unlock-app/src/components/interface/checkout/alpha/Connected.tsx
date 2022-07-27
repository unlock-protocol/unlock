import { Button, Tooltip } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { ReactNode } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { addressMinify, minifyEmail } from '~/utils/strings'
import SvgComponents from '../../svg'
import { CheckoutService } from './Checkout/checkoutMachine'
import { ConnectService } from './Connect/connectMachine'

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
}

export function SignedOut({
  onUnlockAccount,
  authenticateWithProvider,
}: SignedOutProps) {
  const iconButtonClass =
    'inline-flex items-center p-1 hover:[box-shadow:_0px_4px_15px_rgba(0,0,0,0.08)] [box-shadow:_0px_8px_30px_rgba(0,0,0,0.08)] rounded-full'

  return (
    <div className="w-full grid grid-flow-col grid-cols-11">
      <div className="grid items-center col-span-5 justify-items-center space-y-2">
        <h4 className="text-sm"> Have a crypto wallet? </h4>
        <div className="flex items-center w-full justify-around">
          <button
            onClick={() => authenticateWithProvider('METAMASK')}
            type="button"
            className={iconButtonClass}
          >
            <SvgComponents.Metamask width={32} />
          </button>
          <button
            onClick={() => authenticateWithProvider('WALLET_CONNECT')}
            type="button"
            className={iconButtonClass}
          >
            <SvgComponents.WalletConnect width={32} />
          </button>
          <button
            onClick={() => authenticateWithProvider('COINBASE')}
            type="button"
            className={iconButtonClass}
          >
            <SvgComponents.CoinbaseWallet width={32} />
          </button>
        </div>
      </div>
      <div className="col-span-1 flex justify-center">
        <div className="border-l h-full"></div>
      </div>
      <div className="grid items-center space-y-2 col-span-5 justify-items-center">
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
  const [state, send] = useActor(service)
  const { account, email, isUnlockAccount, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
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
        onUnlockAccount={() => {
          send('UNLOCK_ACCOUNT')
        }}
        authenticateWithProvider={authenticateWithProvider}
      />
    </div>
  )
}
