import { useEffect, useState, useContext } from 'react'
import { expirationAsDate } from '../utils/durations'
import { WalletServiceContext } from '../utils/withWalletService'
import { useStorageService } from '../utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { MemberFilters } from '../unlockTypes'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { GraphServiceContext } from '../utils/withGraphService'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import { ConfigContext } from '../utils/withConfig'
import { ToastHelper } from '../components/helpers/toast.helper'

/**
 * Helper function which combines the members and their metadata
 * @param {*} lockWithKeys
 * @param {*} storedMetadata
 */
export const buildMembersWithMetadata = (
  lockWithKeys: any,
  storedMetadata: any
) => {
  const members: any = {}
  const metadataByKeyOwner = storedMetadata.reduce(
    (byKeyOwner: any, key: any) => {
      return {
        ...byKeyOwner,
        [key.userAddress.toLowerCase()]: {
          protected: {
            ...key.data.userMetadata?.protected,
            ...key.data?.extraMetadata,
          },
          public: {
            ...key.data.userMetadata.public,
          },
        },
      }
    },
    {}
  )
  lockWithKeys.keys?.forEach((key: any) => {
    const keyOwner = key.owner.address.toLowerCase()
    const index = `${lockWithKeys.address}-${keyOwner}`
    let member: any = members[index]

    if (!member) {
      member = {
        token: key.keyId,
        lockName: lockWithKeys?.name,
        expiration: expirationAsDate(key.expiration),
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
export const useMembers = (
  lockAddresses: string[],
  viewer: string,
  filter: string,
  page = 0
) => {
  const { network, account } = useContext(AuthenticationContext)
  const config = useContext(ConfigContext)
  const walletService = useContext(WalletServiceContext)
  const web3Service = useContext(Web3ServiceContext)
  const storageService = useStorageService()
  //const storageService = useContext(StorageServiceContext)
  const graphService = useContext(GraphServiceContext)

  graphService.connect(config.networks[network!].subgraphURI)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [members, setMembers] = useState({})
  const [loading, setLoading] = useState(true)
  const [isLockManager, setIsLockManager] = useState(false)

  const login = async () => {
    if (!storageService) return
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network!,
    })
  }

  const getKeysMetadata = async (locks: any) => {
    if (!locks.length) return
    await login()

    const keysMetadataPromise = locks.map(async (lock: any) => {
      return await storageService.getKeysMetadata({
        lockAddress: lock.address,
        network: network!,
        lock,
      })
    })

    const keysMetadata = await Promise.all(keysMetadataPromise)
    return [].concat(...keysMetadata.map((item) => item))
  }

  const loadMembers = async () => {
    setLoading(true)

    let expiresAfter = parseInt(`${new Date().getTime() / 1000}`)
    if (filter === MemberFilters.ALL) {
      expiresAfter = 0
    }
    const first = 30
    const skip = page * first

    const { data } = await graphService.keysByLocks(
      lockAddresses,
      expiresAfter,
      first,
      skip
    )

    const membersForLocksPromise = data.locks.map(async (lock: any) => {
      // If the viewer is not the lock owner, just show the members from chain
      const _isLockManager = await web3Service.isLockManager(
        lock.address,
        viewer,
        network
      )
      setIsLockManager(_isLockManager)
      if (!_isLockManager) {
        return buildMembersWithMetadata(lock, [])
      }
      try {
        if (data?.locks?.length) {
          const storedMetadata = await getKeysMetadata(data?.locks)
          return buildMembersWithMetadata(lock, storedMetadata)
        }
      } catch (error) {
        ToastHelper.error(`Could not list members - ${error}`)
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
  }, [JSON.stringify(lockAddresses), viewer, filter, page])

  const list: any = Object.values(members)
  const columns = generateColumns(list)
  return { loading, list, columns, hasNextPage, isLockManager }
}

export default useMembers
