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
    if (error.response) {
      // Propagate the error as is to be caught by the calling function
      throw error
    }
    // Fallback for other types of errors
    throw new Error('An unexpected error occurred')
  }
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
    ['getDataForGitcoinPassport', lockAddress, network, recipients],
    async () => {
      try {
        return await getDataForGitcoinPassport(network, lockAddress, recipients)
      } catch (error: any) {
        if (error.response && error.response.status === 422) {
          // Display the server's error message for 422 errors
          ToastHelper.error(error.response.data.error)
        } else {
          // Generic error message for other types of errors
          ToastHelper.error(error.message || 'An unexpected error occurred')
        }
        // Return empty values to maintain consistency
        return recipients.map(() => '')
      }
    },
    {
      enabled: false, // Manually trigger the query
      retry: false, // Do not retry after a failure
    }
  )
}
