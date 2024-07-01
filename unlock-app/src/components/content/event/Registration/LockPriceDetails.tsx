import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useLockData } from '~/hooks/useLockData'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { HiOutlineTicket as TicketIcon } from 'react-icons/hi'
import { ExplorerLink } from '~/components/interface/AddressLink'
import { Icon, Placeholder } from '@unlock-protocol/ui'
import { Lock } from '~/unlockTypes'
import { PaywallLockConfigType } from '@unlock-protocol/core'

interface LockPriceInternalsProps {
  lock: Lock
  symbol: string
  price: string
  network: number
  hasUnlimitedKeys: boolean
  isSoldOut: boolean
  keysLeft: number
  showContract?: boolean
  lockCheckoutConfig: PaywallLockConfigType
  hideRemaining: boolean
}
export const LockPriceInternals = ({
  lock,
  network,
  symbol,
  price,
  hasUnlimitedKeys,
  isSoldOut,
  keysLeft,
  showContract = false,
  lockCheckoutConfig,
  hideRemaining,
}: LockPriceInternalsProps) => {
  const name = lockCheckoutConfig.name || lock.name
  return (
    <div className="flex flex-col gap-1">
      {showContract && (
        <div className="flex gap-2 flex-row text-brand-gray">
          {name} <ExplorerLink address={lock.address} network={network} />
        </div>
      )}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <>
            {symbol && <CryptoIcon symbol={symbol} size={30} />}
            <span>
              {price} {price === 'FREE' ? '' : symbol}
            </span>
          </>
        </div>
        {!hideRemaining && (
          <div className="flex items-center gap-2">
            <Icon icon={TicketIcon} size={30} />
            {hasUnlimitedKeys ? (
              <span className="text-base font-bold">&infin;</span>
            ) : (
              <span className="text-base font-bold">
                {isSoldOut ? 'Sold out' : keysLeft}
              </span>
            )}
            {!isSoldOut && <span className="text-gray-600">Left</span>}
          </div>
        )}
      </div>
    </div>
  )
}

interface LockPriceDetailsProps {
  lockAddress: string
  network: number
  showContract?: boolean
  lockCheckoutConfig: PaywallLockConfigType
  hideRemaining: boolean
}

export const LockPriceDetails = ({
  lockAddress,
  network,
  showContract = false,
  lockCheckoutConfig,
  hideRemaining,
}: LockPriceDetailsProps) => {
  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })

  const price =
    lock?.keyPrice && parseFloat(lock?.keyPrice) === 0 ? 'FREE' : lock?.keyPrice

  const keysLeft =
    Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)

  const hasUnlimitedKeys = lock?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT

  const isSoldOut = keysLeft <= 0 && !hasUnlimitedKeys

  const { data: symbol } = useGetLockCurrencySymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  if (isLockLoading || !lock) {
    return (
      <Placeholder.Root>
        <Placeholder.Line width="md" />
        <Placeholder.Root inline>
          <Placeholder.Line width="sm" />
          <Placeholder.Line width="sm" />
        </Placeholder.Root>
      </Placeholder.Root>
    )
  }

  return (
    <LockPriceInternals
      lockCheckoutConfig={lockCheckoutConfig}
      lock={lock}
      network={network}
      symbol={symbol}
      price={price!}
      hasUnlimitedKeys={hasUnlimitedKeys}
      isSoldOut={isSoldOut}
      keysLeft={keysLeft}
      showContract={showContract}
      hideRemaining={hideRemaining}
    />
  )
}
