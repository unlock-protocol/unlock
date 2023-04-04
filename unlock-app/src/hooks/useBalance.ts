import { useQuery } from '@tanstack/react-query'
import { getAccountTokenBalance } from './useAccount'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Options {
  network: number
  currencyContractAddress: string | null
  account?: string
}

export const useBalance = ({
  account,
  network,
  currencyContractAddress,
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

    const isPayable = isGasPayable
    /** Note: we won't really know if user can afford because there could be discounts... */
    /* userCanAffordKey(lock, balance, recipients.length) && isGasPayable */

    const options = {
      balance,
      networkBalance,
      isPayable,
      isGasPayable,
    }

    return options
  })
}
