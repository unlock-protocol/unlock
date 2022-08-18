import { Members } from '../graphql/datasource'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as metadataOperations from './metadataOperations'
import Fuse from 'fuse.js'

const KEY_FILTER_MAPPING: { [key: string]: string } = {
  owner: 'keyholderAddress',
  keyId: 'token',
  email: 'email',
}
/**
 * Filters members base on query
 * @param {Array} members - list of members
 * @param {String} query - query to use as filter on items
 * @return {Array} - list of filtred members by query
 */
async function filterMembers(members: any[], filters: any) {
  const { query, filterKey } = filters
  const searchByCheckInTime = filterKey === 'checkedInAt'
  if (!query?.length && !searchByCheckInTime) return members

  const fuse = new Fuse(members, {
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

export async function getMembersWithMedata({
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
  const client = new Members(network)

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

  const members = metadataOperations.buildMembersWithMetadata(
    lock,
    metadataItems
  )

  return filterMembers(members, filters)
}
