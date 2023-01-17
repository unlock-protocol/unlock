import { useQuery } from '@tanstack/react-query'
import { KeyManager, TransferObject } from '@unlock-protocol/unlock-js'
import { useConfig } from '~/utils/withConfig'
import { useWalletService } from '~/utils/withWalletService'

interface Options {
  transferObject: TransferObject
  transferSignature: string
  network: number
}

export const useTransferPossible = ({
  transferObject,
  transferSignature,
  network,
}: Options) => {
  const walletService = useWalletService()
  const config = useConfig()
  const keyManager = new KeyManager(config.networks)
  const {
    data: isTransferPossible,
    isLoading: isTransferPossibleLoading,
    error: isTransferPossbleError,
  } = useQuery(
    ['isTransferPossible', transferObject, transferSignature],
    async () => {
      const tx = await keyManager.isTransferPossible({
        network,
        params: {
          ...transferObject,
          transferSignature,
        },
        signer: walletService.signer,
      })
      return tx
    }
  )

  return {
    isTransferPossible,
    isTransferPossibleLoading,
    isTransferPossbleError,
  }
}
