import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

const getDataForGitcoinPassport = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  try {
    const response = await locksmith.getDataForRecipientsAndGitcoinPassport(
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
  return useQuery({
    queryKey: ['getDataForGitcoinPassport', lockAddress, network, recipients],
    queryFn: async () => {
      try {
        return await getDataForGitcoinPassport(network, lockAddress, recipients)
      } catch (error: any) {
        if (error.response) {
          // Handle specific error statuses
          const status = error.response.status
          switch (status) {
            case 400:
              ToastHelper.error(
                'The required Gitcoin Passport score is not defined or invalid.'
              )
              error.isInvalidScoreError = true
              break
            case 504:
              ToastHelper.error(
                'Timeout: Unable to verify scores within expected time frame.'
              )
              error.isTimeoutError = true
              break
            case 422:
              ToastHelper.error(error.response.data.error)
              error.isMisconfigurationError = true
              break
            default:
              ToastHelper.error(error.message || 'An unexpected error occurred')
          }
          // Propagate error
          throw error
        } else {
          // Generic error message for other types of errors
          ToastHelper.error(error.message || 'An unexpected error occurred')
        }
        // Return empty values to maintain consistency
        return recipients.map(() => '')
      }
    },
    enabled: false, // Manually trigger the query
    retry: false, // Do not retry after a failure
  })
}
