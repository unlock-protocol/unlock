import { useEffect, useState, useContext } from 'react'
import { expirationAsDate } from '../utils/durations'

import generateKeyTypedData from '../structured_data/keyMetadataTypedData'
import { WalletServiceContext } from '../utils/withWalletService'
import { StorageServiceContext } from '../utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { MemberFilters } from '../unlockTypes'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { GraphServiceContext } from '../utils/withGraphService'
import { AuthenticationContext } from '../components/interface/Authenticate'
import { ConfigContext } from '../utils/withConfig'

/**
 * Helper function to retrieve metadata for a all keys on a lock
 * @param {*} lock
 * @param {string} viewer
 * @param {*} walletService
 * @param {*} storageService
 */
export const getAllKeysMetadataForLock = async (
  lock,
  viewer,
  walletService,
  storageService
) => {
  return new Promise((resolve, reject) => {
    // If the user is the owner, we can grab the metadata for each lock
    const typedData = generateKeyTypedData({
      LockMetaData: {
        address: lock.address,
        owner: viewer,
        timestamp: Date.now(),
      },
    })

    walletService.signData(viewer, typedData, async (error, signature) => {
      if (error) {
        reject('Could not sign typed data for metadata request.')
      }
      const storedMetadata = await storageService.getBulkMetadataFor(
        lock.address,
        signature,
        typedData
      )
      resolve(storedMetadata)
    })
  })
}

/**
 * Helper function which combines the members and their metadata
 * @param {*} lockWithKeys
 * @param {*} storedMetadata
 */
export const buildMembersWithMetadata = (lockWithKeys, storedMetadata) => {
  const members = {}
  const metadataByKeyOwner = storedMetadata.reduce((byKeyOwner, key) => {
    return {
      ...byKeyOwner,
      [key.userAddress.toLowerCase()]: key.data.userMetadata,
    }
  }, {})
  lockWithKeys.keys.forEach((key) => {
    const keyOwner = key.owner.address.toLowerCase()
    const index = `${lockWithKeys.address}-${keyOwner}`
    let member = members[index]
    if (!member) {
      member = {
        token: key.keyId,
        lockName: lockWithKeys.name,
        expiration: expirationAsDate(parseInt(key.expiration)),
        keyholderAddress: keyOwner,
      }
    }

    if (metadataByKeyOwner[keyOwner]) {
      if (metadataByKeyOwner[keyOwner].protected) {
        member = {
          ...member,
          ...metadataByKeyOwner[keyOwner].protected,
        }
      }
      if (metadataByKeyOwner[keyOwner].public) {
        member = {
          ...member,
          ...metadataByKeyOwner[keyOwner].public,
        }
      }
    }

    members[index] = member
  })
  return members
}

/**
 * This hooks yields the members for a lock, along with the metadata when applicable
 * @param {*} address
 */
export const useMembers = (lockAddresses, viewer, filter, page = 0) => {
  const { network } = useContext(AuthenticationContext)
  const config = useContext(ConfigContext)
  const walletService = useContext(WalletServiceContext)
  const web3Service = useContext(Web3ServiceContext)
  const storageService = useContext(StorageServiceContext)
  const graphService = useContext(GraphServiceContext)

  graphService.connect(config.networks[network].subgraphURI)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [members, setMembers] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    setLoading(true)

    let expiresAfter = parseInt(new Date().getTime() / 1000)
    if (filter === MemberFilters.ALL) {
      expiresAfter = 0
    }
    const first = 100
    const skip = page * first

    const { data } = await graphService.keysByLocks(
      lockAddresses,
      expiresAfter,
      first,
      skip
    )

    const membersForLocksPromise = data.locks.map(async (lockWithKeys) => {
      // If the viewer is not the lock owner, just show the members from chain
      const isLockManager = await web3Service.isLockManager(
        lockWithKeys.address,
        viewer,
        network
      )
      if (!isLockManager) {
        return buildMembersWithMetadata(lockWithKeys, [])
      }
      try {
        const storedMetadata = await getAllKeysMetadataForLock(
          lockWithKeys,
          viewer,
          walletService,
          storageService
        )
        return buildMembersWithMetadata(lockWithKeys, storedMetadata)
      } catch (error) {
        setError(`Could not list members - ${error}`)
        return []
      }
    })
    const membersByLock = await Promise.all(membersForLocksPromise)
    const members = Object.values(
      membersByLock.reduce((acc, array) => {
        return {
          ...acc,
          ...array,
        }
      }, {})
    )

    if (members.length > 0) {
      setMembers(members)
      setHasNextPage(Object.keys(members).length === first)
    }
    setLoading(false)
  }

  /**
   * When the keyHolders object changes, load the metadata
   */
  useEffect(() => {
    loadMembers()
  }, [lockAddresses, viewer, filter, page])

  const list = Object.values(members)
  const columns = generateColumns(list)
  return { loading, error, list, columns, hasNextPage }
}

export default useMembers
