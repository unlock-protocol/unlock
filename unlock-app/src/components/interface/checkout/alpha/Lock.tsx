import { twMerge } from 'tailwind-merge'
import { getLockProps } from '~/utils/lock'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from 'react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getFiatPricing } from '~/hooks/useCards'
import { LockState } from './Checkout/checkoutMachine'

interface Props {
  name: string
  address: string
  network: number
  disabled?: string
  className?: string
  onSelect: (lock: LockState) => Promise<unknown> | unknown
}

export function Lock({
  name,
  className,
  address,
  network,
  disabled,
  onSelect,
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
    'border flex flex-col w-full border-gray-400 shadow p-4 rounded-lg',
    disabled && 'cursor-not-allowed opacity-75',
    className
  )

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
        <h3 className="font-bold text-xl"> {name}</h3>
        {!isLoading ? (
          <div className="grid">
            {formattedData.cardEnabled ? (
              <>
                <p>${(lock.fiatPricing?.usd?.keyPrice / 100).toFixed(2)}</p>
                <p>{formattedData?.formattedKeyPrice} </p>
              </>
            ) : (
              <>
                <p>{formattedData?.formattedKeyPrice} </p>
                <p>${(lock.fiatPricing?.usd?.keyPrice / 100).toFixed(2)}</p>
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
          <ul className="flex items-center gap-2 text-sm">
            <li className="inline-flex items-center gap-2">
              <span className="text-gray-500"> Duration: </span>
              <time> {formattedData.formattedDuration} </time>
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="text-gray-500"> Quantity: </span>
              <time> {formattedData.formattedKeysAvailable} </time>
            </li>
          </ul>
        ) : (
          <div className="py-1.5 flex items-center">
            <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
          </div>
        )}
        {disabled && <p className="text-sm flex text-gray-500"> {disabled}</p>}
      </div>
    </button>
  )
}
