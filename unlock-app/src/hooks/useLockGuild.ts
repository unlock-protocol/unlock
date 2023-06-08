import { useQuery } from '@tanstack/react-query'
import { guild } from '@guildxyz/sdk'
import { storage } from '~/config/storage'

export const getLockGuild = async (lockAddress: string, network: number) => {
  const response = await storage.getLockSettings(network, lockAddress)
  if (response?.data?.hookGuildId) {
    return guild.get(response?.data?.hookGuildId)
  }
  return null
}

export const useLockGuild = ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) => {
  return useQuery(['lockGuild', lockAddress, network], async () =>
    getLockGuild(lockAddress, network)
  )
}
