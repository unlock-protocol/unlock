import SvgComponents from '../../svg'

interface LoggedInProps {
  account: string
  onDisconnect(): void
}

export function LoggedIn({ account, onDisconnect }: LoggedInProps) {
  return (
    <div className="flex justify-between text-sm">
      <p>
        Wallet: {account?.slice(0, 4)}...{account?.slice(-4)}
      </p>
      <button onClick={onDisconnect} type="button">
        Disconnect
      </button>
    </div>
  )
}

interface LoggedOutProps {
  authenticateWithProvider(
    provider: 'METAMASK' | 'UNLOCK' | 'WALLET_CONNECT' | 'COINBASE'
  ): Promise<void>
  onUnlockAccount(): void
}

export function LoggedOut({
  onUnlockAccount,
  authenticateWithProvider,
}: LoggedOutProps) {
  const iconButtonClass =
    'inline-flex items-center p-1 hover:[box-shadow:_0px_4px_15px_rgba(0,0,0,0.08)] [box-shadow:_0px_8px_30px_rgba(0,0,0,0.08)] rounded-full'

  return (
    <div className="mb-4 flex justify-center items-center gap-4">
      <button
        onClick={() => authenticateWithProvider('METAMASK')}
        type="button"
        className={iconButtonClass}
      >
        <SvgComponents.Metamask width={40} />
      </button>
      <button
        onClick={() => authenticateWithProvider('WALLET_CONNECT')}
        type="button"
        className={iconButtonClass}
      >
        <SvgComponents.WalletConnect width={40} />
      </button>
      <button
        onClick={() => authenticateWithProvider('COINBASE')}
        type="button"
        className={iconButtonClass}
      >
        <SvgComponents.CoinbaseWallet width={40} />
      </button>
      <button
        onClick={() => onUnlockAccount()}
        type="button"
        className={iconButtonClass}
      >
        <SvgComponents.UnlockMonogram width={40} />
      </button>
    </div>
  )
}
