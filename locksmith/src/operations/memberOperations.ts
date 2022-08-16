import { Members } from '../graphql/datasource'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as metadataOperations from './metadataOperations'

export async function getMembersWithMedata({
  network,
  lockAddress,
  filters,
  loggedInUserAddress,
}: {
  network: number
  lockAddress: string
  filters: string
  loggedInUserAddress: string
}) {
  const web3Service = new Web3Service(networks)
  const isLockOwner = await web3Service.isLockManager(
    lockAddress,
    loggedInUserAddress,
    network
  )

  const client = new Members(network)
  const [lock] = await client.get({
    addresses: [lockAddress],
    filters: JSON.parse((filters as string) ?? '{}'),
  })

  // get metadata only if the logged user is the lockManager
  let metadataItems = []
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

  return members
}
