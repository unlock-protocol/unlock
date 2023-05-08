import { useQuery } from '@tanstack/react-query'
import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { PaywallConfig } from '~/unlockTypes'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useGetLockSettings } from './useLockSettings'

interface Options {
  currencyContractAddress?: string | null
  symbol: string
  lockAddress: string
  network: number
  recipients: string[]
  data: string[]
  paywallConfig: PaywallConfig
  enabled?: boolean
}

export const usePricing = ({
  lockAddress,
  network,
  recipients,
  data,
  paywallConfig,
  currencyContractAddress,
  symbol,
  enabled = true,
}: Options) => {
  const web3Service = useWeb3Service()
  const { data: lockSettings } = useGetLockSettings({
    lockAddress,
    network,
  })

  return useQuery(
    ['purchasePriceFor', network, lockAddress, recipients, data, lockSettings],
    async () => {
      const decimals = currencyContractAddress
        ? await web3Service.getTokenDecimals(currencyContractAddress!, network)
        : networks[network].nativeCurrency?.decimals || 18

      const prices = await Promise.all(
        recipients.map(async (userAddress, index) => {
          const referrer = getReferrer(userAddress, paywallConfig)
          const options = {
            lockAddress,
            network,
            userAddress,
            referrer,
            data: data?.[index] || '0x',
          }

          const creditCardAmount = lockSettings?.creditCardPrice ?? 0
          const price = await web3Service.purchasePriceFor(options)
          const amount = parseFloat(ethers.utils.formatUnits(price, decimals))

          return {
            symbol,
            userAddress,
            amount,
            decimals,
            creditCardAmount,
          }
        })
      )
      const item = {
        prices,
        total: prices.reduce((acc, item) => acc + item.amount, 0),
        creditCardTotal: prices.reduce(
          (acc, item) => acc + item.creditCardAmount,
          0
        ),
      }
      return item
    },
    {
      refetchInterval: 1000 * 60 * 5,
      enabled,
    }
  )
}
