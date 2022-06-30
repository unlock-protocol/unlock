import { twMerge } from 'tailwind-merge'
import { getLockProps } from '~/utils/lock'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from 'react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getFiatPricing } from '~/hooks/useCards'
import { LockState } from './Checkout/checkoutMachine'
import { RiArrowRightLine as RightArrowIcon } from 'react-icons/ri'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
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
      ...lockData,
      network,
      name,
      address,
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
      <div className="flex w-full mb-2 items-start justify-between">
        <div>
          <h3 className="font-bold text-xl"> {name}</h3>
          {recurring && (
            <span className="bg-brand-ui-primary bg-opacity-80 group-disabled:group-hover:bg-opacity-80 group-hover:bg-opacity-100 p-1 px-2 rounded-full text-xs font-semibold text-white">
              Recurring x {recurring}
            </span>
          )}
        </div>
        {!isLoading ? (
          <div className="grid text-right">
            {formattedData.cardEnabled ? (
              <>
                {!!fiatPrice && (
                  <span className="font-semibold">
                    ${(fiatPrice / 100).toFixed(2)}
                  </span>
                )}
                <span>{formattedData?.formattedKeyPrice} </span>
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {formattedData?.formattedKeyPrice}{' '}
                </span>
                {!!fiatPrice && <span>${(fiatPrice / 100).toFixed(2)}</span>}
              </>
            )}
          </div>
        ) : (
          <div className="flex gap-2 flex-col items-center">
            <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
            <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="border-t pt-2 w-full">
        {!isLoading ? (
          <div className="flex items-center justify-between">
            <ul className="flex items-center gap-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <span className="text-gray-500"> Duration: </span>
                <time> {formattedData.formattedDuration} </time>
              </li>
              <li className="inline-flex items-center gap-2">
                {formattedData.isSoldOut ? (
                  <span> Sold out </span>
                ) : (
                  <>
                    <span className="text-gray-500"> Quantity: </span>
                    <span> {formattedData.formattedKeysAvailable} </span>
                  </>
                )}
              </li>
            </ul>
            <div className="flex items-center justify-end">
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
    </button>
  )
}
