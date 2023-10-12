import { useQuery } from '@tanstack/react-query'
import { getAccountTokenBalance } from './useAccount'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Options {
  network: number
  currencyContractAddress: string | null
  account?: string
  requiredAmount?: number
}

export const useBalance = ({
  account,
  network,
  currencyContractAddress,
  requiredAmount = 0,
}: Options) => {
  const web3Service = useWeb3Service()
  return useQuery(['balance', account], async () => {
    const [balance, networkBalance] = await Promise.all([
      getAccountTokenBalance(
        web3Service,
        account!,
        currencyContractAddress,
        network
      ),
      getAccountTokenBalance(web3Service, account!, null, network),
    ])

    const isGasPayable = parseFloat(networkBalance) > 0 // TODO: improve actual calculation

    const options = {
      balance,
      networkBalance,
      isGasPayable,
      isPayable: parseFloat(balance) >= requiredAmount,
    }

    return options
  })
}
