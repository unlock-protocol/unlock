import { useQuery } from '@tanstack/react-query'
import { getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { locksmith } from '~/config/locksmith'
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

  return useQuery({
    queryKey: ['getPrice', network, hash],
    queryFn: async (): Promise<any> => {
      const tokenAddress =
        currencyContractAddress === DEFAULT_USER_ACCOUNT_ADDRESS
          ? undefined
          : currencyContractAddress

      const decimals = await getErc20Decimals(tokenAddress ?? '', provider)
      const total = ethers.formatUnits(`${amount}`, decimals)

      const response = await locksmith.price(
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
    },
  })
}

interface GetTotalChargesProps {
  lockAddress: string
  network: number
  recipients?: string[]
  purchaseData?: string[]
  enabled?: boolean
}
export const useGetTotalCharges = ({
  lockAddress,
  network,
  purchaseData,
  recipients,
  enabled = true,
}: GetTotalChargesProps) => {
  return useQuery({
    queryKey: [
      'getTotalChargesForLock',
      lockAddress,
      network,
      recipients,
      purchaseData,
    ],
    queryFn: async () => {
      if (!recipients || recipients.length === 0) {
        // Let's add a random recipient to check what would be the "theoretical price"
        // TODO: this would break if the lock has a hook
        recipients = [ethers.Wallet.createRandom().address]
        purchaseData = ['']
      }
      if (!purchaseData) {
        purchaseData = recipients.map(() => '')
      }
      const pricing = await locksmith
        .getChargesForLock(network, lockAddress, purchaseData, recipients)
        .catch((e) => {
          if (e.response.status === 400) {
            return { data: null }
          }
          throw e
        })

      return pricing.data
    },
    enabled,
  })
}
