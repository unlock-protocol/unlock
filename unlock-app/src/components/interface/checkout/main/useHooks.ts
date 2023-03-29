import { useQuery } from '@tanstack/react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface PasswordHookSignersProps {
  lockAddress: string
  network: number
}
export function usePasswordHookSigners({
  lockAddress,
  network,
}: PasswordHookSignersProps) {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()

  const getSigners = async (): Promise<string> => {
    const walletService = await getWalletService(network)

    // get password hook contract by network
    const contractAddress = await web3Service.onKeyPurchaseHook({
      lockAddress,
      network,
    })

    return await web3Service.getPasswordHookSigners(
      {
        lockAddress,
        contractAddress,
        network,
      },
      walletService.signer
    )
  }

  return useQuery(
    ['getSigners', lockAddress, network],
    async () => getSigners(),
    {
      enabled: !!lockAddress && !!network,
    }
  )
}
