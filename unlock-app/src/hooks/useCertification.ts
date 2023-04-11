import { useQuery } from '@tanstack/react-query'
import { SubgraphKey, SubgraphService } from '@unlock-protocol/unlock-js'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface CertificationProps {
  lockAddress: string
  tokenId?: string
  network: number
}

export const useCertification = ({
  lockAddress,
  network,
  tokenId,
}: CertificationProps) => {
  return useQuery(
    ['getCertification', lockAddress, network, tokenId],
    async () => {
      const subgraph = new SubgraphService()
      const key = await subgraph.key(
        {
          where: {
            tokenId,
            lock_in: [lockAddress.toLowerCase()],
          },
        },
        {
          network,
        }
      )

      if (key) {
        return key
      }
      return {} as SubgraphKey
    },
    {
      enabled: !!lockAddress && !!network && !!tokenId,
      placeholderData: {
        id: '1',
        network,
        tokenId: '#',
        owner: `{Recipient's wallet address, or ENS}`,
        expiration: '{Expiration date}',
        createdAtBlock: undefined,
        transactionsHash: ['{Transaction hash}'],
        lock: {} as any,
      },
      onError: (error) => {
        console.error(error)
        ToastHelper.error('No valid certification')
      },
    }
  )
}
