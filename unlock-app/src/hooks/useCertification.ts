import { useQuery } from '@tanstack/react-query'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

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
    owner: `{Recipient's wallet address, or ENS}`,
    expiration: '{Expiration date}',
    createdAtBlock: undefined,
    transactionsHash: ['{Transaction hash}'],
    lock: {} as any,
  }
  const { account } = useAuth()

  return useQuery(
    ['getCertification', lockAddress, network, tokenId, account],
    async () => {
      const subgraph = new SubgraphService()
      if (tokenId) {
        // Get ths certification matching the token id
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
      } else if (account) {
        // Get the certification for the current user
        const key = await subgraph.key(
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
    {
      enabled: !!lockAddress && !!network,
      placeholderData,
      onError: (error) => {
        console.error(error)
        ToastHelper.error('No valid certification')
      },
    }
  )
}
