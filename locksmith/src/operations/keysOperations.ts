import { keysByQuery } from '../graphql/datasource'
import {
  SubgraphKey,
  SubgraphLock,
  Web3Service,
} from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'
import normalizer from '../utils/normalizer'
import { getUserAddressesMatchingData } from './userMetadataOperations'

const KEY_FILTER_MAPPING: { [key: string]: string } = {
  owner: 'keyholderAddress',
  tokenId: 'token',
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
        const { userMetadata, extraMetadata } =
          metadataItems?.find(
            (metadata) =>
              normalizer.ethereumAddress(metadata?.userAddress) ===
              normalizer.ethereumAddress(key?.owner)
          )?.data ?? {}

        const metadata = {
          ...userMetadata?.public,
          ...userMetadata?.protected,
          ...extraMetadata,
        }

        const merged = {
          token: key?.tokenId,
          lockName: lock?.name,
          expiration: key?.expiration,
          keyholderAddress: key?.owner,
          // defaults to the owner when the manager is not set
          keyManager: key?.manager || key?.owner,
          lockAddress: lock?.address,
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
 * In the current (bad) approach: we get all keys and then we filter them.
 * It's obviously bad for large locks because getting all keys fails spectacularly
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
  const web3Service = new Web3Service(networks)
  const isLockOwner = await web3Service.isLockManager(
    lockAddress,
    loggedInUserAddress,
    network
  )

  let metadataItems: any[] = []

  let keysFilter = filters
  // Ok so if the filters is not an _onchain_ thing we need to first get the addresses that would match it!
  if (filters.filterKey === 'email') {
    const addresses = await getUserAddressesMatchingData(
      network,
      lockAddress,
      filters.query
    )
    if (addresses.length === 0) {
      return []
    }
    keysFilter = {
      ...filters,
      query: addresses[0], // What happens if there are muliple?
      filterKey: 'owner',
    }
  }

  const [lock] = await keysByQuery({
    network,
    addresses: [lockAddress],
    filters: keysFilter,
  })

  // only lock manager can see metadata
  if (isLockOwner) {
    metadataItems = await metadataOperations.getKeysMetadata({
      keys: lock?.keys || [],
      network,
      lockAddress,
    })
  }

  const keys = buildKeysWithMetadata(lock as Lock, metadataItems)

  return filterKeys(keys, filters)
}
