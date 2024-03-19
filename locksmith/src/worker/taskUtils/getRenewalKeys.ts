import { getKeysToRenew } from '../../graphql/datasource'

// gets keys to renew that expire(d) within start + now and end + now
// Catch any key that will expire in the next hour :
// createAddRenewalJobs(0, 60 * 60)
export const getRenewalKeys = async ({
  start,
  end,
  network,
}: {
  start: number
  end: number
  network: number
}) => {
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
