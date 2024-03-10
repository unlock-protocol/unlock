import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'

const getDataForGitcoinPassport = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  try {
    const response = await storage.getDataForRecipientsAndGitcoinPassport(
      network,
      lockAddress,
      recipients
    )

    return response.data.result
  } catch (error: any) {
    if (error.response.data.error) {
      throw new Error(error.response.data.error)
    }
    return recipients.map(() => '')
  }
  return recipients.map(() => '')
}

interface UseDataForGitcoinPassportProps {
  lockAddress: string
  network: number
  recipients: string[]
}

export function useDataForGitcoinPassport({
  lockAddress,
  network,
  recipients,
}: UseDataForGitcoinPassportProps) {
  return useQuery(
    ['getDataForGitcoinPassport', lockAddress, network],
    async () => {
      try {
        return getDataForGitcoinPassport(network, lockAddress, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
        // Return empty values by default
        return recipients.map(() => '')
      }
    },
    {
      // manually trigger hook
      enabled: false,
      retry: false,
    }
  )
}
