import { getKeysToRenew } from '../../graphql/datasource'

export const getRenewalKeys = async ({
  within,
  network,
}: {
  within: number
  network: number
}) => {
  // timeframe to check for renewal
  const end = Math.floor(Date.now() / 1000)
  const start = within ? end - within : undefined
  const items = []
  let more = true
  let page = 0
  if (more) {
    const keys = await getKeysToRenew({
      start,
      end,
      network,
      page,
      limit: 1000,
      minimumLockVersion: 10,
      // We can allow native currency for fiat keys as well
      allowNativeCurrency: true,
    })
    if (keys.length) {
      items.push(...keys)
      page++
    } else {
      more = false
    }
  }
  return items
}
