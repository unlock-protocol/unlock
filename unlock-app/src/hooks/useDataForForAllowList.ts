import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import networks from '@unlock-protocol/networks'

const getDataForAllowList = async (
  root: string,
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  // Get the list
  // For each, get the proof
  // format it right!
  // const root = web3Ser
  const response = fetch(
    `https://merkle-trees.unlock-protocol.com/${root}.json`
  )
  console.log((await response).json())
  console.log(root, network, lockAddress, recipients)
  return recipients.map(() => '')
}

interface UseDataForAllowListProps {
  hookAddress: string
  lockAddress: string
  network: number
  recipients: string[]
}

export function useDataForAllowList({
  hookAddress,
  lockAddress,
  network,
  recipients,
}: UseDataForAllowListProps) {
  console.log(networks[network].hooks)
  const web3Service = useWeb3Service()
  return useQuery({
    queryKey: ['getAllowList', lockAddress, network, hookAddress, recipients],
    queryFn: async () => {
      try {
        const root = await web3Service.getMerkleRootFromAllowListHook({
          lockAddress,
          network,
          hookAddress,
        })
        return getDataForAllowList(root, network, lockAddress, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
        return recipients.map(() => '') // Return empty values by default
      }
    },
    retry: false,
  })
}
