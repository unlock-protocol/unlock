import { twMerge } from 'tailwind-merge'
import { getLockProps } from '~/utils/lock'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from 'react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getFiatPricing } from '~/hooks/useCards'
import { LockState } from './Checkout/checkoutMachine'
import {
  RiArrowRightLine as RightArrowIcon,
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
} from 'react-icons/ri'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
import { LabeledItem } from './LabeledItem'
import * as Avatar from '@radix-ui/react-avatar'
interface Props {
  name: string
  address: string
  network: number
  recurring?: number
  disabled?: boolean
  className?: string
  loading?: boolean
  onSelect: (lock: LockState) => Promise<unknown> | unknown
}

export function Lock({
  name,
  className,
  address,
  network,
  disabled,
  onSelect,
  loading,
  recurring,
}: Props) {
  const config = useConfig()
  const web3Service = useWeb3Service()
  const { isLoading, data: lock } = useQuery(address, async () => {
    const [lockData, fiatPricing] = await Promise.all([
      web3Service.getLock(address, network),
      getFiatPricing(config, address, network),
    ])
    return {
      network,
      address,
      ...lockData,
      fiatPricing,
    }
  })

  const formattedData = lock
    ? getLockProps(
        lock,
        network,
        config.networks[network].baseCurrencySymbol,
        name!
      )
    : ({} as any)

  const Lock = twMerge(
    'border flex flex-col w-full border-gray-400 shadow p-4 rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white',
    className
  )

  const fiatPrice = lock?.fiatPricing?.usd?.keyPrice
  const lockImageURL = `${config.services.storage.host}/lock/0x9f1aa26d95EfA450C40F2D7d1830910766A843aE/icon`
  const lockName = name || lock?.name
  const fiatEnabled = lock?.fiatPricing.cardEnabled
  return (
    <button
      type="button"
      disabled={!!disabled || isLoading || formattedData?.isSoldOut}
      onClick={(event) => {
        event.preventDefault()
        onSelect(lock)
      }}
      className={Lock}
    >
      <div className="flex w-full mb-2 items-center gap-4">
        <Avatar.Root>
          <Avatar.Image
            className="inline-flex items-center justify-center w-20 h-20 rounded-xl"
            src={lockImageURL}
            alt={lockName}
            width={64}
            height={64}
          />
          <Avatar.Fallback className="inline-flex items-center justify-center w-20 h-20 rounded-xl">
            {lockName?.slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="w-full flex flex-col space-y-2">
          <div className="flex w-full items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-lg"> {lockName}</h3>
              {recurring && (
                <span className="bg-brand-ui-primary bg-opacity-80 group-disabled:group-hover:bg-opacity-80 group-hover:bg-opacity-100 p-1 px-2 rounded-full text-xs font-semibold text-white">
                  Recurring x {recurring}
                </span>
              )}
            </div>
            {!isLoading ? (
              <Pricing
                isCardEnabled={fiatEnabled}
                usdPrice={(fiatPrice / 100).toFixed(2)}
                keyPrice={formattedData.formattedKeyPrice}
              />
            ) : (
              <PricingPlaceholder />
            )}
          </div>
          <div className="pt-2 w-full flex border-t">
            {!isLoading ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 sm:flex-col sm:items-start flex-wrap">
                  <LabeledItem
                    label="Duration"
                    icon={DurationIcon}
                    value={formattedData.formattedDuration || 'Forever'}
                  />
                  <LabeledItem
                    label="Quantity"
                    icon={QuantityIcon}
                    value={
                      formattedData.isSoldOut
                        ? 'Sold out'
                        : formattedData.formattedKeysAvailable
                    }
                  />
                </div>
                <div>
                  {!(disabled || loading) && (
                    <RightArrowIcon
                      className="group-hover:fill-brand-ui-primary group-hover:translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
                      size={20}
                    />
                  )}
                  {loading && (
                    <LoadingIcon size={20} className="animate-spin" />
                  )}
                </div>
              </div>
            ) : (
              <div className="py-1.5 flex items-center">
                <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

interface PricingProps {
  isCardEnabled: boolean
  usdPrice?: string
  keyPrice?: string
}

export function Pricing({ usdPrice, keyPrice, isCardEnabled }: PricingProps) {
  const isFiatEnabled = !!usdPrice
  if (isCardEnabled) {
    return (
      <div className="grid text-right">
        {isFiatEnabled && <span className="font-semibold">${usdPrice}</span>}
        <span className="text-sm text-gray-500">{keyPrice} </span>
      </div>
    )
  } else {
    return (
      <div className="grid text-right">
        <span className="font-semibold">{keyPrice} </span>
        {isFiatEnabled && (
          <span className="text-sm text-gray-500">${usdPrice}</span>
        )}
      </div>
    )
  }
}

export function PricingPlaceholder() {
  return (
    <div className="flex gap-2 flex-col items-center">
      <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
      <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
    </div>
  )
}
