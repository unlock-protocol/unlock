import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { ToastHelper } from '~/components/helpers/toast.helper'

const getDataForGuild = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  try {
    const response = await storage.getDataForRecipientsAndGuild(
      network,
      lockAddress,
      recipients
    )
    return response.data
  } catch (error: any) {
    if (error.response.data.error) {
      throw new Error(error.response.data.error)
    }
    return ''
  }
  return ''
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
  return useQuery(
    ['getDataForGuild', lockAddress, network],
    async () => {
      try {
        return getDataForGuild(network, lockAddress, recipients)
      } catch (error: any) {
        ToastHelper.error(error.message)
      }
    },
    {
      retry: false,
    }
  )
}
