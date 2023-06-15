import { useQuery } from '@tanstack/react-query'
import { getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { storage } from '~/config/storage'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface GetPriceProps {
  network: number
  amount: string | number
  currencyContractAddress?: string
  hash?: string
}

// get usd price and formatted price for amount with decimals
export const useGetPrice = ({
  network,
  amount = '0', // amount with decimals
  currencyContractAddress,
  hash,
}: GetPriceProps) => {
  const web3Service = useWeb3Service()
  const provider = web3Service.providerForNetwork(network)

  return useQuery(['getPrice', network, hash], async (): Promise<any> => {
    const tokenAddress =
      currencyContractAddress === DEFAULT_USER_ACCOUNT_ADDRESS
        ? undefined
        : currencyContractAddress

    const decimals = await getErc20Decimals(tokenAddress ?? '', provider)
    const total = ethers.utils.formatUnits(`${amount}`, decimals)

    const response = await storage.price(
      network,
      parseFloat(total),
      tokenAddress
    )

    return {
      usd:
        parseFloat(
          (response?.data?.result?.priceInAmount ?? 0)?.toString()
        ).toFixed(2) || 0,
      total,
    }
  })
}

interface GetTotalChargesProps {
  lockAddress: string
  network: number
  recipients: string[]
  purchaseData: string[]
  enabled?: boolean
}
export const useGetTotalCharges = ({
  lockAddress,
  network,
  purchaseData,
  recipients,
  enabled = true,
}: GetTotalChargesProps) => {
  return useQuery(
    ['getTotalChargesForLock', lockAddress, network],
    async () => {
      return {
        creditCardProcessingFee: 52,
        unlockServiceFee: 66,
        gasCost: 0,
        total: 777,
        prices: [
          {
            userAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
            amount: 0.004,
            symbol: 'ETH',
          },
        ],
      }
      /*return {
        unlockServiceFee: 66,
        creditCardProcessingFee: 51,
        gasCost: 0,
        total: 772,
        recipients: [
          {
            address: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
            price: {
              amount: 0.004,
              decimals: 18,
              symbol: 'ETH',
              amountInUSD: 6.55412,
              amountInCents: 655,
            },
          },
        ],
        isCreditCardPurchasable: true,
      } */
      const pricing = await storage.getChargesForLock(
        network,
        lockAddress,
        purchaseData,
        recipients
      )

      return pricing.data
    },
    {
      enabled,
    }
  )
}
