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

interface UseDataForGuildHookProps {
  lockAddress: string
  network: number
  recipients: string[]
}

export function useDataForGuildHook({
  lockAddress,
  network,
  recipients,
}: UseDataForGuildHookProps) {
  return useQuery(['getLockSettings', lockAddress, network], async () => {
    return getDataForGuild(network, lockAddress, recipients)
  })
}
