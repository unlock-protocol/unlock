import { keysByQuery } from '../graphql/datasource'
import { SubgraphKey, SubgraphLock } from '@unlock-protocol/unlock-js'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'
import normalizer from '../utils/normalizer'
import { getUserAddressesMatchingData } from './userMetadataOperations'
import { Rsvp } from '../models'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { getWeb3Service } from '../initializers'
import * as membershipOperations from './membershipOperations'
import pLimit from 'p-limit'

const KEY_FILTER_MAPPING: { [key: string]: string } = {
  owner: 'keyholderAddress',
  tokenId: 'token',
  email: 'email',
  transactionHash: 'transactionsHash',
}

const RENEWAL_FILTER_FETCH_LIMIT = 5000

type RenewalStatus =
  | 'all'
  | 'will renew'
  | 'needs approval'
  | 'balance low'
  | 'needs purchase'
  | 'not renewable'

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

const getRenewalStatus = (membershipState: {
  isRenewable: boolean
  isAutoRenewable: boolean
  isRenewableIfReApproved: boolean
  isRenewableIfRePurchased: boolean
}): RenewalStatus => {
  if (!membershipState.isRenewable) {
    return 'not renewable'
  }

  if (membershipState.isAutoRenewable) {
    return 'will renew'
  }

  if (membershipState.isRenewableIfReApproved) {
    return 'needs approval'
  }

  if (membershipState.isRenewableIfRePurchased) {
    return 'needs purchase'
  }

  return 'balance low'
}

async function addRenewalStatusToKeys({
  keys,
  lock,
  lockAddress,
  network,
}: {
  keys: any[]
  lock: Partial<SubgraphLock>
  lockAddress: string
  network: number
}) {
  const renewalStatusLimit = pLimit(5)

  return Promise.all(
    keys.map((key) =>
      renewalStatusLimit(async () => {
        if (!key?.token) {
          return {
            ...key,
            renewalStatus: 'not renewable',
          }
        }

        try {
          const membershipState = await membershipOperations.getMembershipState(
            {
              key: {
                expiration: key.expiration,
                lock: {
                  version: lock?.version,
                },
              },
              tokenAddress: lock?.tokenAddress || '',
              network,
              lockAddress,
              tokenId: `${key.token}`,
            },
          )

          return {
            ...key,
            renewalStatus: getRenewalStatus(membershipState),
            renewalCurrency: membershipState.currency,
          }
        } catch {
          return {
            ...key,
            renewalStatus: 'not renewable',
          }
        }
      })
    )
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
  const renewalFilter = filters.renewal || 'all'
  const shouldFilterByRenewal =
    renewalFilter !== 'all' &&
    ['pending', 'denied'].indexOf(filters.approval) === -1

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

  if (shouldFilterByRenewal) {
    keysFilter = {
      ...keysFilter,
      page: 0,
      max: RENEWAL_FILTER_FETCH_LIMIT,
    }
  }

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
    lock = (
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

  if (shouldFilterByRenewal) {
    filteredKeys = (
      await addRenewalStatusToKeys({
        keys: filteredKeys,
        lock,
        lockAddress,
        network,
      })
    ).filter((key) => key.renewalStatus === renewalFilter)

    return {
      keys: filteredKeys.slice(page * limit, page * limit + limit),
      total: filteredKeys.length,
    }
  }

  return {
    keys: filteredKeys,
    total: lock.totalKeys,
  }
}
