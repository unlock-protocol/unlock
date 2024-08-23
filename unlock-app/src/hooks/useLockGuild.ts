import { useQuery } from '@tanstack/react-query'
import guildClient from '~/config/guild'
import { locksmith } from '~/config/locksmith'

export const getLockGuild = async (lockAddress: string, network: number) => {
  const response = await locksmith.getLockSettings(network, lockAddress)
  if (response?.data?.hookGuildId) {
    return guildClient.guild.get(response?.data?.hookGuildId)
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
  return useQuery({
    queryKey: ['lockGuild', lockAddress, network],
    queryFn: () => getLockGuild(lockAddress, network),
  })
}
