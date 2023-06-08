import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'

const getDataForGuild = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  const response = await storage.getDataForRecipientsAndGuild(
    network,
    lockAddress,
    recipients
  )
  return response.data.result
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
    ['getLockSettings', lockAddress, network],
    async () => {
      return getDataForGuild(network, lockAddress, recipients)
    }
  )
}
