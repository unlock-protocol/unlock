import { keysByQuery } from '../graphql/datasource'
import { SubgraphKey, SubgraphLock } from '@unlock-protocol/unlock-js'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'
import normalizer from '../utils/normalizer'
import { getUserAddressesMatchingData } from './userMetadataOperations'
import { Rsvp } from '../models'
import { PAGE_SIZE } from '@unlock-protocol/core'
import { getWeb3Service } from '../initializers'

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
  const filteredKeys = await filterKeys(keys, filters)
  return {
    keys: filteredKeys,
    total: lock.totalKeys,
  }
}
