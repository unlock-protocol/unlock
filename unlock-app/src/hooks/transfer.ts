import { useMutation } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { TransferObject } from '@unlock-protocol/unlock-js'
import { AxiosError } from 'axios'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Options {
  lockAddress: string
  network: number
  keyId: string
  onTransferCodeCreated?: (transferObject: TransferObject) => void
}

export const useTransferCode = ({
  network,
  lockAddress,
  keyId,
  onTransferCodeCreated,
}: Options) => {
  const {
    mutate: createTransferCode,
    isLoading,
    data,
  } = useMutation(
    ['transferCode', network, lockAddress, keyId],
    async ({ captcha }: { captcha: string }): Promise<TransferObject> => {
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
      const transferObject: TransferObject & { transferCode: string } = {
        deadline,
        owner,
        lock,
        token,
        transferCode,
      }
      return transferObject
    },
    {
      onError(error: Error) {
        if (error instanceof AxiosError) {
          if (error.status === 429) {
            ToastHelper.error(
              'Too many requests. Please try again after 5 minutes.'
            )
          } else {
            ToastHelper.error('Transfer code creation failed')
          }
        }
        ToastHelper.error(error.message)
      },
      onSuccess(transferObject: TransferObject) {
        if (onTransferCodeCreated) {
          onTransferCodeCreated(transferObject)
        }
      },
    }
  )

  return {
    createTransferCode,
    isLoading,
    transferObject: data,
  }
}
