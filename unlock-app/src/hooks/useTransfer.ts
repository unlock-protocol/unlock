import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
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
  const mutation = useMutation({
    mutationKey: ['transferCode', network, lockAddress, keyId],
    mutationFn: async ({
      captcha,
    }: {
      captcha: string
    }): Promise<KeyTransferData> => {
      const response = await locksmith.createTransferCode(
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
    retry: 3,
  })

  return {
    createTransferCode: mutation.mutate,
    isLoading: mutation.isPending,
    transferObject: mutation.data,
  }
}

export const useTransferDone = () => {
  const mutation = useMutation({
    mutationFn: async (
      option: TransferObject & { transferSignature: string; network: number }
    ): Promise<void> => {
      await locksmith.transferDone(option)
    },
    retry: 3,
  })

  return {
    transferDone: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  }
}
