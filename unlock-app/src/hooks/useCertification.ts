import { useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'

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
      return await subgraph.key(
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
    }
  )
}
