import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useLockData } from '~/hooks/useLockData'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { HiOutlineTicket as TicketIcon } from 'react-icons/hi'
import { AddressLink } from '~/components/interface/AddressLink'
import { Icon, Placeholder } from '@unlock-protocol/ui'

interface LockPriceDetailsProps {
  lockAddress: string
  network: number
  metadata?: any
  showContract?: boolean
}

export const LockPriceDetails = ({
  lockAddress,
  network,
  showContract = false,
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

  const isSoldOut = keysLeft === 0 && !hasUnlimitedKeys

  const { data: symbol } = useGetLockCurrencySymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  if (isLockLoading) {
    return (
      <Placeholder.Root inline>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <>
            {symbol && <CryptoIcon symbol={symbol} size={30} />}
            <span>{price}</span>
          </>
        </div>
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
      </div>
      {showContract && (
        <div className="flex gap-2 flex-rows">
          <span className="text-brand-gray">Ticket contract</span>
          <AddressLink lockAddress={lockAddress} network={network} />
        </div>
      )}
    </div>
  )
}
