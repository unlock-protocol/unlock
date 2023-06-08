import { useQuery } from '@tanstack/react-query'
import { user, guild } from '@guildxyz/sdk'
import { useAuth } from '~/contexts/AuthenticationContext'

export const getUserGuilds = async ({ account }: { account?: string }) => {
  try {
    if (!account) {
      return []
    }
    const userGuilds = await user.getMemberships(account) // Returns every Guild and Role of a given user
    if (!userGuilds) {
      return []
    }
    const guilds = await Promise.all(
      userGuilds
        // @ts-expect-error Property 'isAdmin' does not exist on type '{ guildId: number; roleids: number[]; }'.ts(2339)
        ?.filter(({ isAdmin }) => isAdmin)
        .map(({ guildId }) => {
          return guild.get(guildId)
        })
    )
    return guilds
  } catch (error) {
    console.error(error)
    return []
  }
}

export const useUserGuilds = () => {
  const { account } = useAuth()
  return useQuery(
    ['userGuilds', account],
    async () =>
      getUserGuilds({
        account,
      }),
    {
      enabled: !!account,
    }
  )
}
