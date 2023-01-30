import { useQuery } from '@tanstack/react-query'
import { getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { storage } from '~/config/storage'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useWalletService } from '~/utils/withWalletService'

interface GetPriceProps {
  network: number
  amount: string
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
  const walletService = useWalletService()
  const provider = walletService.providerForNetwork(network)

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
