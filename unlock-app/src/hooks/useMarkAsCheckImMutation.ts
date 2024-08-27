import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'

interface UseMarkAsCheckInMutationProps {
  network: number
  data: { lockAddress: string; token: string }
  setCheckedInTimestamp: (timestamp: string) => void
}

export const useMarkAsCheckInMutation = ({
  network,
  data,
  setCheckedInTimestamp,
}: UseMarkAsCheckInMutationProps) => {
  const onMarkAsCheckIn = async () => {
    const { lockAddress, token: keyId } = data
    return locksmith.checkTicket(network, lockAddress, keyId)
  }

  return useMutation({
    mutationFn: onMarkAsCheckIn,
    onSuccess: () => {
      setCheckedInTimestamp(new Date().toLocaleString())
      ToastHelper.success('Successfully marked ticket as checked-in')
    },
    onError: (error: Error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          ToastHelper.error('Ticket already checked-in')
          return
        }
      }
      ToastHelper.error('Error on marking ticket as checked-in')
    },
  })
}
