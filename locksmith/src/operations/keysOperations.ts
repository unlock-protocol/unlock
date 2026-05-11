import { keysByQuery } from '../graphql/datasource/keysByQuery'
import type { SubgraphKey, SubgraphLock } from '@unlock-protocol/unlock-js'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'
import normalizer from '../utils/normalizer'
import { getUserAddressesMatchingData } from './userMetadataOperations'
import { Rsvp } from '../models'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { getWeb3Service } from '../initializers'
import * as subscriptionOperations from './subscriptionOperations'

export enum RenewalStatus {
  ALL = 'all',
  WILL_RENEW = 'will_renew',
  NEEDS_APPROVAL = 'needs_approval',
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  NOT_RENEWABLE = 'not_renewable',
}

type Subscription = Awaited<
  ReturnType<typeof subscriptionOperations.getSubscriptionsForLockByOwner>
>[number]

const RENEWAL_FILTER_STATUSES = new Set<string>([
  RenewalStatus.WILL_RENEW,
  RenewalStatus.NEEDS_APPROVAL,
  RenewalStatus.INSUFFICIENT_BALANCE,
  RenewalStatus.NOT_RENEWABLE,
])

const toBigInt = (value?: string) => {
  try {
    return BigInt(value || 0)
  } catch {
    return BigInt(0)
  }
}

export const getRenewalStatusForSubscriptions = (
  subscriptions: Subscription[] = []
) => {
  if (subscriptions.length === 0) {
    return RenewalStatus.NOT_RENEWABLE
  }

  let hasApproval = false
  let hasBalance = false

  for (const subscription of subscriptions) {
    const approvedRenewals = toBigInt(subscription.approvedRenewals)
    const possibleRenewals = toBigInt(subscription.possibleRenewals)

    if (approvedRenewals > 0 && possibleRenewals > 0) {
      return RenewalStatus.WILL_RENEW
    }

    hasApproval = hasApproval || approvedRenewals > 0
    hasBalance = hasBalance || possibleRenewals > 0
  }

  if (!hasBalance) {
    return RenewalStatus.INSUFFICIENT_BALANCE
  }

  if (!hasApproval) {
    return RenewalStatus.NEEDS_APPROVAL
  }

  return RenewalStatus.NOT_RENEWABLE
}

const shouldFilterByRenewal = (renewal?: string) => {
  return !!renewal && RENEWAL_FILTER_STATUSES.has(renewal)
}

const KEY_FILTER_MAPPING: { [key: string]: string } = {
  owner: 'keyholderAddress',
  tokenId: 'token',
  email: 'email',
  transactionHash: 'transactionsHash',
}
/**
 * Filters keys base on query
 * @param {Array} keys - list of keys
 * @param {String} query - query to use as filter on items
 * @return {Array} - list of filtred keys by query
 */
async function filterKeys(keys: any[], filters: any) {
  const { query, filterKey } = filters
  const searchByCheckInTime = filterKey === 'checkedInAt'
  if (!query?.length && !searchByCheckInTime) return keys

  const fuse = new Fuse(keys, {
    threshold: 0,
    ignoreLocation: true,
    useExtendedSearch: true,
    keys: [KEY_FILTER_MAPPING[filterKey] ?? filterKey],
  })

  if (!searchByCheckInTime) {
    return fuse.search(`'${query}`).map(({ item }) => item)
  }

  return fuse.remove((item: any) => {
    return item?.checkedInAt
  })
}

const getKeysForRenewalFilter = async ({
  network,
  addresses,
  filters,
}: {
  network: number
  addresses: string[]
  filters: any
}) => {
  let lock: any
  let after = filters.after || ''
  let hasMore = true
  const keys: Partial<SubgraphKey>[] = []

  while (hasMore) {
    const [currentLock] = await keysByQuery({
      network,
      addresses,
      filters: {
        ...filters,
        page: 0,
        max: 1000,
        after,
      },
    })

    if (!currentLock) {
      break
    }

    lock = lock || currentLock
    const currentKeys = currentLock.keys || []
    keys.push(...currentKeys)

    after = currentKeys[currentKeys.length - 1]?.tokenId || ''
    hasMore = currentKeys.length === 1000 && !!after
  }

  if (!lock) {
    return undefined
  }

  return {
    ...lock,
    keys,
  }
}

const addRenewalStatus = async ({
  keys,
  network,
  lockAddress,
}: {
  keys: any[]
  network: number
  lockAddress: string
}) => {
  return Promise.all(
    keys.map(async (key) => {
      if (!key?.token) {
        return {
          ...key,
          renewalStatus: RenewalStatus.NOT_RENEWABLE,
        }
      }

      const subscriptions =
        await subscriptionOperations.getSubscriptionsForLockByOwner({
          tokenId: `${key.token}`,
          lockAddress,
          network,
        })

      return {
        ...key,
        renewalStatus: getRenewalStatusForSubscriptions(subscriptions),
      }
    })
  )
}

type Lock = Omit<Partial<SubgraphLock>, 'keys'> & {
  keys: Partial<SubgraphKey>[]
}

/** merge keys items with the corresponding metadata value */
export const buildKeysWithMetadata = (
  lock: Lock,
  metadataItems: any[]
): any[] => {
  return (
    lock?.keys
      ?.map((key: Partial<SubgraphKey>) => {
        // get key metadata for the owner
        const metadataItem =
          metadataItems?.find(
            (metadata) =>
              normalizer.ethereumAddress(metadata?.userAddress) ===
              normalizer.ethereumAddress(key?.owner)
          )?.data ?? {}
        const { userMetadata, extraMetadata } = metadataItem

        const metadata = {
          ...userMetadata?.public,
          ...userMetadata?.protected,
          ...extraMetadata,
        }

        // @ts-expect-error Property 'approval' does not exist on type 'Partial<Key>'. (but it exists on the keys constructred from RSVP)
        if (key.approval) {
          // @ts-expect-error Property 'approval' does not exist on type 'Partial<Key>'. (but it exists on the keys constructred from RSVP)
          metadata.approval = key.approval
        }

        const merged = {
          token: key?.tokenId,
          lockName: lock?.name,
          expiration: key?.expiration,
          createdAt: key?.createdAt,
          keyholderAddress: key?.owner,
          // defaults to the owner when the manager is not set
          keyManager: key?.manager || key?.owner,
          lockAddress: lock?.address,
          transactionsHash: key?.transactionsHash,
          ...metadata,
        }
        return merged
      })
      .filter(Boolean) || []
  )
}

/**
 * Returns keys with their metadata
 * This supports pagination and filtering
 * @param param0
 * @returns
 */
export async function getKeysWithMetadata({
  network,
  lockAddress,
  filters,
  loggedInUserAddress,
}: {
  network: number
  lockAddress: string
  filters: any
  loggedInUserAddress: string
}) {
  const web3Service = getWeb3Service()
  const isLockOwner = await web3Service.isLockManager(
    lockAddress,
    loggedInUserAddress,
    network
  )

  let metadataItems: any[] = []

  let keysFilter = filters

  // Ok so if the filters is not an _onchain_ thing we need to first get the addresses that would match it!
  if (filters.filterKey === 'email' && filters.query) {
    const addresses = await getUserAddressesMatchingData(
      network,
      lockAddress,
      filters.query
    )
    if (addresses.length === 0) {
      return { total: 0, keys: [] }
    }
    keysFilter = {
      ...filters,
      query: addresses[0], // TODO: consider what happens if there are muliple?
      filterKey: 'owner',
    }
  }

  let lock: any
  const limit = filters.max || PAGE_SIZE
  const page = filters.page || 0
  const hasRenewalFilter = shouldFilterByRenewal(filters.renewal)
  if (['pending', 'denied'].indexOf(filters.approval) > -1) {
    const rsvps = await Rsvp.findAll({
      where: {
        lockAddress,
        network,
        approval: filters.approval,
      },
      limit,
      offset: page * limit,
    })
    // Count the RSVPs
    const total = await Rsvp.count({
      where: {
        lockAddress,
        network,
        approval: filters.approval,
      },
    })

    lock = {
      address: lockAddress,
      network,
      keys: rsvps.map((r) => {
        return {
          approval: r.approval,
          owner: r.userAddress,
        }
      }),
      totalKeys: total,
    }
  } else {
    // Get from subgraph!
    lock = hasRenewalFilter
      ? await getKeysForRenewalFilter({
          network,
          addresses: [lockAddress],
          filters: keysFilter,
        })
      : (
          await keysByQuery({
            network,
            addresses: [lockAddress],
            filters: keysFilter,
          })
        )[0]
  }

  // only lock manager can see metadata
  if (isLockOwner) {
    metadataItems = await metadataOperations.getKeysMetadata({
      keys: lock?.keys || [],
      network,
      lockAddress,
    })
  }

  const keys = buildKeysWithMetadata(lock as Lock, metadataItems)
  let filteredKeys = await filterKeys(keys, filters)
  let total = lock.totalKeys

  if (hasRenewalFilter) {
    filteredKeys = (
      await addRenewalStatus({
        keys: filteredKeys,
        network,
        lockAddress,
      })
    ).filter((key) => key.renewalStatus === filters.renewal)

    total = filteredKeys.length
    filteredKeys = filteredKeys.slice(page * limit, (page + 1) * limit)
  }

  return {
    keys: filteredKeys,
    total,
  }
}
