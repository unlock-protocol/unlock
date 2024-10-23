import { useQuery } from '@tanstack/react-query'
import guildClient from '~/config/guild'
import { useAuthenticate } from './useAuthenticate'

export const getUserGuilds = async ({ account }: { account?: string }) => {
  try {
    if (!account) {
      return []
    }
    const userGuilds = await guildClient.user.getMemberships(account) // Returns every Guild and Role of a given user
    if (!userGuilds) {
      return []
    }
    const guilds = await Promise.all(
      userGuilds
        ?.filter(({ isAdmin }) => isAdmin)
        .map(({ guildId }) => {
          return guildClient.guild.get(guildId)
        })
    )
    return guilds
  } catch (error) {
    console.error(error)
    return []
  }
}

export const useUserGuilds = () => {
  const { account } = useAuthenticate()
  return useQuery({
    queryKey: ['userGuilds', account],
    queryFn: async () =>
      getUserGuilds({
        account,
      }),
    enabled: !!account,
  })
}
