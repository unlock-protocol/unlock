import { useQuery } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { HookType } from '@unlock-protocol/types'
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
  // get password hook contract by network
  const contractAddress = networks[network]?.hooks?.onKeyPurchaseHook?.find(
    (hook) => hook.id === HookType.PASSWORD
  )?.address

  const getSigners = async (): Promise<string> => {
    if (!contractAddress) return ''
    const walletService = await getWalletService(network)
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
      enabled: !!contractAddress && !!lockAddress && !!network,
    }
  )
}
