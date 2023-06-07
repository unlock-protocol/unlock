import { useQuery } from '@tanstack/react-query'
import { storage } from '~/config/storage'
import { user, guild } from '@guildxyz/sdk'
import { getLockGuild } from './useLockGuild'

const getDataForGuild = async (
  network: number,
  lockAddress: string,
  recipients: string[]
) => {
  const guildInfo = await getLockGuild(lockAddress, network)
  if (!guildInfo) {
    return null
  }
  const accesses = await Promise.all(
    recipients.map(async (recipient: string) => {
      return await guild.getUserAccess(guildInfo.id, recipient) // Access checking for an address for a specific Guild
    })
  )
  console.log(accesses)

  // const response = await storage.getDataForRecipientsAndCaptcha(
  //   lockAddress,
  //   network,
  //   recipients
  // )
  // console.log(response)
  return null
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
  return useQuery(['getLockSettings', lockAddress, network], async () => {
    const data = await getDataForGuild(network, lockAddress, recipients)
    return data
  })
}
