import { useEffect, useState, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import { expirationAsDate } from '../utils/durations'
import keyHolderQuery from '../queries/keyholdersByLock'
import generateKeyTypedData from '../structured_data/keyMetadataTypedData'
import { WalletServiceContext } from '../utils/withWalletService'
import { StorageServiceContext } from '../utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { MemberFilters } from '../unlockTypes'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'

/**
 * Helper function to retrieve metadata for a all keys on a lock
 * @param {*} lock
 * @param {*} walletService
 * @param {*} storageService
 * @param {*} dispatch
 */
export const getAllKeysMetadataForLock = async (
  lock,
  walletService,
  storageService,
  dispatch
) => {
  return new Promise((resolve, reject) => {
    // If the user is the owner, we can grab the metadata for each lock
    const typedData = generateKeyTypedData({
      LockMetaData: {
        address: lock.address,
        owner: lock.owner,
        timestamp: Date.now(),
      },
    })

    dispatch(waitForWallet())
    walletService.signData(lock.owner, typedData, async (error, signature) => {
      dispatch(dismissWalletCheck())
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
 * @param {*} lock
 * @param {*} storedMetadata
 */
export const buildMembersWithMetadata = (lock, storedMetadata) => {
  let members = {}
  const metadataByKeyOwner = storedMetadata.reduce((byKeyOwner, key) => {
    return {
      ...byKeyOwner,
      [key.userAddress.toLowerCase()]: key.data.userMetadata,
    }
  }, {})
  lock.keys.forEach(key => {
    const keyOwner = key.owner.address.toLowerCase()
    const index = `${lock.address}-${keyOwner}`
    let member = members[index]
    if (!member) {
      member = {
        token: key.keyId,
        lockName: lock.name,
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

    members = {
      ...members,
      [index]: member,
    }
  })
  return members
}

/**
 * This hooks yields the members for a lock, along with the metadata when applicable
 * @param {*} address
 */
export const useMembers = (lockAddresses, viewer, filter) => {
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)
  const dispatch = useDispatch()
  const [members, setMembers] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  let expiresAfter = parseInt(new Date().getTime() / 1000)
  if (filter === MemberFilters.ALL) {
    expiresAfter = 0
  }
  const {
    loading: membersLoading,
    error: membersError,
    data: keyHolders,
  } = useQuery(keyHolderQuery(), {
    variables: {
      addresses: lockAddresses,
      expiresAfter,
    },
  })

  const loadMetadataAndForKeyHolders = async () => {
    if (!keyHolders || !keyHolders.locks) {
      return
    }
    setLoading(true)
    const membersForLocksPromise = keyHolders.locks.map(async lock => {
      // If the viewer is not the lock owner, just show the members from chain
      if (lock.owner.toLowerCase() !== viewer.toLowerCase()) {
        return buildMembersWithMetadata(lock, [])
      }
      try {
        const storedMetadata = await getAllKeysMetadataForLock(
          lock,
          walletService,
          storageService,
          dispatch
        )
        return buildMembersWithMetadata(lock, storedMetadata)
      } catch (error) {
        setError(`Could not list members - ${error}`)
        return []
      }
    })
    const membersForLocks = await Promise.all(membersForLocksPromise)
    if (membersForLocks.length > 0) {
      setMembers(Object.assign(...membersForLocks))
    }
    setLoading(false)
  }

  /**
   * set loading while keyHolderQuery is loading
   */
  useEffect(() => {
    setLoading(membersLoading)
  }, [membersLoading])

  /**
   * set error if keyHolderQuery yields an error
   */
  useEffect(() => {
    setError(membersError)
  }, [membersError])

  /**
   * When the keyHolders object changes, load the metadata
   */
  useEffect(() => {
    loadMetadataAndForKeyHolders()
  }, [JSON.stringify(keyHolders)])

  const list = Object.values(members)
  const columns = generateColumns(list)
  return { loading, error, list, columns }
}

export default useMembers
