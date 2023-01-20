import { useQuery } from '@tanstack/react-query'
import { KeyManager, TransferObject } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'
import {
  EthersError,
  getParsedEthersError,
} from '@enzoferey/ethers-error-parser'
interface Options {
  transferObject: TransferObject
  transferSignature: string
  network: number
  enabled?: boolean
}

export const useTransferPossible = ({
  transferObject,
  transferSignature,
  network,
  enabled = true,
}: Options) => {
  const walletService = useWalletService()
  const config = useConfig()
  const keyManager = new KeyManager(config.networks)
  const {
    data: isTransferPossible,
    isInitialLoading: isTransferPossibleLoading,
    error,
  } = useQuery(
    ['isTransferPossible', transferObject, transferSignature],
    async () => {
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
