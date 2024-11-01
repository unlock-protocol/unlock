import { Badge, minifyAddress } from '@unlock-protocol/ui'
import { formatNumber } from '~/utils/formatter'
import { Lock } from '~/unlockTypes'
import { useMetadata } from '~/hooks/metadata'
import { getLockTypeByMetadata } from '@unlock-protocol/core'

interface PricingDataProps {
  prices: any
  lock: Lock
  network: number
  payment?: any
}

export function PricingData({ prices, lock, payment }: PricingDataProps) {
  const { data: metadata } = useMetadata({
    lockAddress: lock.address,
    network: lock.network,
  })
  const { isEvent } = getLockTypeByMetadata(metadata)

  const typeOfNFT = isEvent ? 'Ticket' : 'Membership'

  return (
    <div>
      {!!prices?.length &&
        prices.map((item: any, index: number) => {
          const first = index <= 0

          const discount =
            Number(lock!.keyPrice) > 0
              ? (100 * (Number(lock!.keyPrice) - item.amount)) /
                Number(lock!.keyPrice)
              : 0

          const symbol = (
            payment?.route?.trade
              ? payment.route.trade.inputAmount.currency.symbol
              : item.symbol
          ).toUpperCase()

          return (
            <div
              key={index}
              className={`flex border-b ${
                first ? 'border-t' : null
              } items-center justify-between text-sm px-0 py-2`}
            >
              <div>
                1 {typeOfNFT} for{' '}
                <span className="font-medium">
                  {minifyAddress(item.userAddress)}
                </span>{' '}
                {item.amount < Number(lock!.keyPrice) ? (
                  <Badge variant="green" size="tiny">
                    {discount.toFixed(2)}% Discount
                  </Badge>
                ) : null}
              </div>

              {/* We hide the unit prices since we don't have them when using swap and pay */}
              {!payment.route && item.amount && (
                <span className="font-bold whitespace-nowrap">
                  {payment?.route
                    ? `${formatNumber(
                        payment.route
                          .convertToQuoteToken(item.amount.toString())
                          .toFixed()
                      ).toLocaleString()} ${symbol}`
                    : `${formatNumber(item.amount).toLocaleString()} ${symbol}`}
                </span>
              )}
            </div>
          )
        })}
    </div>
  )
}
