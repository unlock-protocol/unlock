import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'

const getDataForAllowList = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  // Get the list
  // For each, get the proof
  // format it right!
  console.log(network, lockAddress, recipients)
  return recipients.map(() => '')
}

interface UseDataForAllowListProps {
  lockAddress: string
  network: number
  recipients: string[]
}

export function useDataForAllowList({
  lockAddress,
  network,
  recipients,
}: UseDataForAllowListProps) {
  return useQuery({
    queryKey: ['getAllowList', lockAddress, network],
    queryFn: async () => {
      try {
        return await getDataForAllowList(network, lockAddress, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
        return recipients.map(() => '') // Return empty values by default
      }
    },
    retry: false,
  })
}
