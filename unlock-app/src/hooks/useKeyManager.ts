import { useQuery } from '@tanstack/react-query'
import {
  KeyManager,
  SubgraphService,
  TransferObject,
} from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import {
  EthersError,
  getParsedEthersError,
} from '@enzoferey/ethers-error-parser'
import { useAuth } from '~/contexts/AuthenticationContext'
interface Options {
  transferObject: TransferObject
  transferSignature: string
  network: number
  enabled?: boolean
}

interface KeyManagerProps {
  lockAddress: string
  network: number
  tokenId: string
}

export const useKeyManager = ({
  lockAddress,
  network,
  tokenId,
}: KeyManagerProps) => {
  const { isLoading, data: manager = null } = useQuery(
    ['getManagers', lockAddress, network, tokenId],
    async () => {
      const subgraph = new SubgraphService()
      const result = await subgraph.key(
        {
          where: {
            lock: lockAddress,
            tokenId,
          },
        },
        {
          network,
        }
      )

      // defaults to the onwer when the manager is not set
      return result?.manager ?? result?.owner ?? ''
    }
  )

  return {
    isLoading,
    manager,
  }
}

// todo: remove? not used anywhere
export const useTransferPossible = ({
  transferObject,
  transferSignature,
  network,
  enabled = true,
}: Options) => {
  const { getWalletService } = useAuth()
  const config = useConfig()
  const keyManager = new KeyManager(config.networks)
  const {
    data: isTransferPossible,
    isInitialLoading: isTransferPossibleLoading,
    error,
  } = useQuery(
    ['isTransferPossible', transferObject, transferSignature],
    async () => {
      const walletService = await getWalletService(network)
      await keyManager.isTransferPossible({
        network,
        params: {
          ...transferObject,
          transferSignature,
        },
        signer: walletService.signer,
      })
      return true
    },
    {
      enabled,
    }
  )

  const isTransferPossbleError = error
    ? getParsedEthersError(error as EthersError)
    : undefined

  return {
    isTransferPossible,
    isTransferPossibleLoading,
    isTransferPossbleError,
  }
}
