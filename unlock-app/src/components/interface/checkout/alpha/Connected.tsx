import { Button, Tooltip } from '@unlock-protocol/ui'
import { ReactNode } from 'react'
import SvgComponents from '../../svg'

interface SignedInProps {
  account: string
  onDisconnect(): void
}

export function SignedIn({ account, onDisconnect }: SignedInProps) {
  return (
    <div className="flex  items-center justify-between text-sm">
      <p>
        Wallet: {account?.slice(0, 4)}...{account?.slice(-4)}
      </p>
      <Tooltip side="top" tip="Disconnecting will reset the checkout progress">
        <button
          className="font-medium text-gray-600 hover:text-black"
          onClick={onDisconnect}
          type="button"
        >
          Disconnect
        </button>
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
            event.stopPropagation()
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

interface Props {
  account?: string
  onDisconnect(): void
  authenticateWithProvider(
    provider: 'METAMASK' | 'UNLOCK' | 'WALLET_CONNECT' | 'COINBASE'
  ): Promise<void>
  onUnlockAccount(): void
  children?: ReactNode
}

export function Connected({
  account,
  onDisconnect,
  authenticateWithProvider,
  onUnlockAccount,
  children,
}: Props) {
  return (
    <div>
      {account ? (
        <div className="space-y-2">
          {children}
          <SignedIn account={account} onDisconnect={onDisconnect} />
        </div>
      ) : (
        <div>
          <SignedOut
            onUnlockAccount={onUnlockAccount}
            authenticateWithProvider={authenticateWithProvider}
          />
        </div>
      )}
    </div>
  )
}
