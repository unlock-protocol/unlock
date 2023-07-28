import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface PasswordHookSignersProps {
  lockAddress: string
  network: number
}
export function usePasswordHookSigner({
  lockAddress,
  network,
}: PasswordHookSignersProps) {
  const web3Service = useWeb3Service()

  const getSigners = async (): Promise<string> => {
    // get password hook contract by network
    const contractAddress = await web3Service.onKeyPurchaseHook({
      lockAddress,
      network,
    })

    if (contractAddress && contractAddress !== ethers.constants.AddressZero) {
      return await web3Service.getPasswordHookSigners({
        lockAddress,
        contractAddress,
        network,
      })
    }
    return ''
  }

  return useQuery(
    ['getSigners', lockAddress, network],
    async () => getSigners(),
    {
      enabled: !!lockAddress && !!network,
    }
  )
}
