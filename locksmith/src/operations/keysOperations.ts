import { keysByQuery } from '../graphql/datasource'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'

interface SubgraphLock {
  keys: {
    owner: {
      address: string
    }
    keyId: string
    expiration: string
  }[]
  address: string
  name: string
  owner: string
}

const KEY_FILTER_MAPPING: { [key: string]: string } = {
  owner: 'keyholderAddress',
  keyId: 'token',
  email: 'email',
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
    keys: [KEY_FILTER_MAPPING[filterKey] ?? filterKey],
  })

  if (!searchByCheckInTime) {
    return fuse.search(query).map(({ item }) => item)
  }

  return fuse.remove((item: any) => {
    return item?.checkedInAt
  })
}

/** merge keys items with the corresponding metadata value */
export const buildKeysWithMetadata = (
  lock: SubgraphLock,
  metadataItems: any[]
) => {
  return lock?.keys
    ?.map((key: any) => {
      // get key metadata for the owner
      const { userMetadata, extraMetadata } =
        metadataItems?.find(
          (metadata) =>
            metadata?.userAddress?.toLowerCase() ===
            key?.owner?.address?.toLowerCase()
        )?.data ?? {}

      const metadata = {
        ...userMetadata?.private,
        ...userMetadata?.protected,
        ...extraMetadata,
      }

      const merged = {
        token: key?.keyId,
        lockName: lock?.name,
        expiration: key?.expiration,
        keyholderAddress: key?.owner?.address,
        lockAddress: lock?.address,
        ...metadata,
      }
      return merged
    })
    .filter(Boolean)
}

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
  const web3Service = new Web3Service(networks)
  const isLockOwner = await web3Service.isLockManager(
    lockAddress,
    loggedInUserAddress,
    network
  )

  let metadataItems = []
  const client = new keysByQuery(network)

  const [lock] = await client.get({
    addresses: [lockAddress],
    filters,
  })

  // only lock manager can see metadata
  if (isLockOwner) {
    metadataItems = await metadataOperations.getKeysMetadata({
      keys: lock?.keys || [],
      network,
      lockAddress,
    })
  }

  const keys = buildKeysWithMetadata(lock, metadataItems)

  return filterKeys(keys, filters)
}
