import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { TransferObject } from '@unlock-protocol/unlock-js'

interface Options {
  lockAddress: string
  network: number
  keyId: string
}

export type KeyTransferData = TransferObject & {
  transferCode: string
}

export const useTransferCode = ({ network, lockAddress, keyId }: Options) => {
  const {
    mutate: createTransferCode,
    isLoading,
    data,
  } = useMutation(
    ['transferCode', network, lockAddress, keyId],
    async ({ captcha }: { captcha: string }): Promise<KeyTransferData> => {
      const response = await storage.createTransferCode(
        network!,
        lockAddress!,
        keyId!,
        {
          headers: {
            captcha,
          },
        }
      )
      const { deadline, owner, lock, token, transferCode } = response.data
      if (!deadline || !owner || !lock || !token || !transferCode) {
        throw new Error('Invalid transfer code response')
      }
      const transferObject: KeyTransferData = {
        deadline,
        owner,
        lock,
        token,
        transferCode,
      }
      return transferObject
    },
    {
      retry: 3,
    }
  )

  return {
    createTransferCode,
    isLoading,
    transferObject: data,
  }
}

export const useTransferDone = () => {
  const {
    mutate: transferDone,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(
    async (
      option: TransferObject & { transferSignature: string; network: number }
    ): Promise<void> => {
      await storage.transferDone(option)
    },
    {
      retry: 3,
    }
  )
  return {
    transferDone,
    isLoading,
    isError,
    error,
    data,
  }
}
