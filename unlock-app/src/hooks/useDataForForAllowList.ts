import { useQuery } from '@tanstack/react-query'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'

import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'

const getDataForAllowList = async (root: string, recipients: string[]) => {
  const response = await fetch(
    `https://merkle-trees.unlock-protocol.com/${root}.json`
  )
  const tree = StandardMerkleTree.load(await response.json())
  const data = recipients.map((recipient) => {
    for (const [node, leaf] of tree.entries()) {
      if (leaf[0].toLowerCase() === recipient.toLowerCase()) {
        // formatting the proof to be used in the smart contract
        // remove 0x prefix and concatenate the proof, add 0x in front.
        return `0x${tree
          .getProof(node)
          .map((p) => p.slice(2))
          .join('')}`
      }
    }
    return ''
  })
  return data
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
        return getDataForAllowList(root, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
        return recipients.map(() => '') // Return empty values by default
      }
    },
    retry: false,
  })
}
