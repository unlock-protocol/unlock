import { useQuery } from '@tanstack/react-query'
import { KeyManager, TransferObject } from '@unlock-protocol/unlock-js'
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
      const signer = walletService.signer
      if (!signer) {
        return
      }
      await keyManager.isTransferPossible({
        network,
        params: {
          ...transferObject,
          transferSignature,
        },
        signer,
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
