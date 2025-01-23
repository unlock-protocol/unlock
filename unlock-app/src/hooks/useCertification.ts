import { useQuery } from '@tanstack/react-query'
import { useAuthenticate } from './useAuthenticate'
import { graphService } from '~/config/subgraph'

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
  // Placeholder
  const placeholderData = {
    id: '1',
    network,
    tokenId: '#', // sets isPlaceholderData
    owner: "{Recipient's wallet address, or ENS}",
    expiration: '{Expiration date}',
    createdAtBlock: undefined,
    createdAt: new Date().getTime(),
    transactionsHash: ['{Transaction hash}'],
    lock: {
      id: lockAddress,
      address: lockAddress,
      name: 'Placeholder Lock',
      expirationDuration: null,
      tokenAddress: null,
      price: '0',
      lockManagers: [],
      version: 1,
      totalKeys: '0',
    },
  }
  const { account } = useAuthenticate()

  return useQuery({
    queryKey: ['getCertification', lockAddress, network, tokenId, account],
    queryFn: async () => {
      if (tokenId) {
        // Get the certification matching the token id
        const key = await graphService.key(
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
        throw new Error('No valid certification for this token')
      } else if (account) {
        // Get the certification for the current user
        const key = await graphService.key(
          {
            where: {
              owner: account.toLowerCase(),
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
      }
      return placeholderData
    },
    enabled: !!lockAddress && !!network,
    placeholderData,
    retry: false, // Disable retries for this query
  })
}
