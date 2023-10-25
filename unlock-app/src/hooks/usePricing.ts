import { useQuery } from '@tanstack/react-query'
import { PaywallConfigType } from '@unlock-protocol/core'
import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Options {
  currencyContractAddress?: string | null
  symbol: string | undefined | null
  lockAddress: string
  network: number
  recipients: string[]
  data: string[]
  paywallConfig: PaywallConfigType
  enabled?: boolean
  payment?: any
}

export const purchasePriceFor = async (
  web3Service: any,
  {
    lockAddress,
    network,
    recipients,
    data,
    paywallConfig,
    currencyContractAddress,
    symbol,
  }: Options
) => {
  const decimals = currencyContractAddress
    ? await web3Service.getTokenDecimals(currencyContractAddress!, network)
    : networks[network].nativeCurrency?.decimals || 18

  const prices = await Promise.all(
    recipients.map(async (userAddress, index) => {
      const referrer = getReferrer(userAddress, paywallConfig, lockAddress)
      const options = {
        lockAddress,
        network,
        userAddress,
        referrer,
        data: data?.[index] || '0x',
      }
      const price = await web3Service.purchasePriceFor(options)
      const amount = parseFloat(ethers.utils.formatUnits(price, decimals))
      return {
        symbol,
        userAddress,
        amount,
        decimals,
      }
    })
  )
  return prices
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
  payment,
}: Options) => {
  const web3Service = useWeb3Service()
  return useQuery(
    ['purchasePriceFor', network, lockAddress, recipients, data],
    async () => {
      const prices = await purchasePriceFor(web3Service, {
        lockAddress,
        network,
        recipients,
        data,
        paywallConfig,
        currencyContractAddress,
        symbol,
        payment,
      })
      // Totals needs to be expressed in the currency of the payment if applicable
      let total = prices.reduce((acc, item) => acc + item.amount, 0)
      if (payment?.route?.quote) {
        total = payment.route!.quote.toFixed()
      } else if (payment?.route?.tx.value) {
        total = Number(ethers.utils.formatEther(payment.route!.tx.value))
      }
      const item = {
        prices,
        total,
      }
      return item
    },
    {
      retry: false,
      refetchInterval: 1000 * 60 * 5,
      enabled,
    }
  )
}
