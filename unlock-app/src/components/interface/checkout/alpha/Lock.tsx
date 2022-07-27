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
      name: name ?? lockData?.name,
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
    'border flex flex-col w-full border-gray-400 shadow rounded-lg group hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white',
    className
  )

  const fiatPrice = lock?.fiatPricing?.usd?.keyPrice
  const usdKeyPrice = fiatPrice ? (fiatPrice / 100).toFixed(2) : undefined
  const lockImageURL = `${config.services.storage.host}/lock/${lock?.address}/icon`
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
      <div className="w-full flex flex-col space-y-2">
        <div className="flex gap-4 items-center p-4">
          <div>
            <Avatar.Root className="flex items-center justify-center w-16 h-16 rounded-xl">
              {!isLoading && (
                <Avatar.Image
                  src={lockImageURL}
                  alt={lockName}
                  width={64}
                  height={64}
                />
              )}
              <Avatar.Fallback>
                {lockName?.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
          </div>
          <div className="flex items-start justify-between w-full">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-left"> {lockName}</h3>
              {recurring && (
                <span className="bg-brand-ui-primary bg-opacity-80 group-disabled:group-hover:bg-opacity-80 group-hover:bg-opacity-100 p-1 px-2 rounded-full text-xs font-semibold text-white">
                  Recurring x {recurring}
                </span>
              )}
            </div>
            {!isLoading ? (
              <Pricing
                isCardEnabled={fiatEnabled}
                usdPrice={usdKeyPrice}
                keyPrice={formattedData.formattedKeyPrice}
              />
            ) : (
              <PricingPlaceholder />
            )}
          </div>
        </div>
        <div className="w-full flex items-center border-t px-4 py-2">
          {!isLoading ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <LabeledItem
                  label="Duration"
                  icon={DurationIcon}
                  value={formattedData.formattedDuration}
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
                {loading && <LoadingIcon size={20} className="animate-spin" />}
              </div>
            </div>
          ) : (
            <div className="py-1.5 flex items-center">
              <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
            </div>
          )}
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
