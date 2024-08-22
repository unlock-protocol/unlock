import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

const getDataForGuild = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  try {
    const response = await locksmith.getDataForRecipientsAndGuild(
      network,
      lockAddress,
      recipients
    )
    return response.data.result
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    return recipients.map(() => '')
  }
}

interface UseDataForGuildProps {
  lockAddress: string
  network: number
  recipients: string[]
}

export function useDataForGuild({
  lockAddress,
  network,
  recipients,
}: UseDataForGuildProps) {
  return useQuery({
    queryKey: ['getDataForGuild', lockAddress, network],
    queryFn: async () => {
      try {
        return await getDataForGuild(network, lockAddress, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
        return recipients.map(() => '') // Return empty values by default
      }
    },
    retry: false,
  })
}
