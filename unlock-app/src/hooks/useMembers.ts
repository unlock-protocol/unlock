import { useEffect, useState, useContext } from 'react'
import { expirationAsDate } from '../utils/durations'
import { useWalletService } from '../utils/withWalletService'
import { useStorageService } from '../utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { MemberFilter } from '../unlockTypes'
import { Web3ServiceContext } from '../utils/withWeb3Service'
import { GraphServiceContext } from '../utils/withGraphService'
import { AuthenticationContext } from '../contexts/AuthenticationContext'
import { ConfigContext } from '../utils/withConfig'
import { ToastHelper } from '../components/helpers/toast.helper'
import { BigNumber, ethers } from 'ethers'

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
            ...key.data?.userMetadata?.protected,
            ...key.data?.extraMetadata,
          },
          public: {
            ...key.data?.userMetadata?.public,
          },
        },
      }
    },
    {}
  )
  lockWithKeys.keys?.forEach((key: any) => {
    const keyOwner = key.owner.address.toLowerCase()
    const index = `${lockWithKeys.address}-${keyOwner}-${key.keyId}` // lets add keyId to see mutiple keys for the same address
    let member: any = members[index]

    if (!member) {
      member = {
        token: key.keyId,
        lockName: lockWithKeys?.name,
        expiration: expirationAsDate(key.expiration),
        keyholderAddress: keyOwner,
        lockAddress: lockWithKeys.address,
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
export const useMembers = ({
  viewer,
  lockAddresses = [],
  expiration = 'active',
  page = 0,
  query = '',
  filterKey = '',
}: {
  lockAddresses: string[]
  viewer: string
  page: number
  query: string
  filterKey: string
  expiration?: MemberFilter
}) => {
  const { network, account } = useContext(AuthenticationContext)
  const config = useContext(ConfigContext)
  const walletService = useWalletService()
  const web3Service = useContext(Web3ServiceContext)
  const storageService = useStorageService()
  //const storageService = useContext(StorageServiceContext)
  const graphService = useContext(GraphServiceContext)

  graphService.connect(config.networks[network!].subgraphURI)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [members, setMembers] = useState({})
  const [loading, setLoading] = useState(true)
  const [isLockManager, setIsLockManager] = useState(false)
  const [membersCount, setMembersCount] = useState<{
    total: number
    active: number
  }>({
    active: 0,
    total: 0,
  })

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
    try {
      setLoading(true)

      const expireTimestamp = parseInt(`${new Date().getTime() / 1000}`)

      const first = 30
      const skip = page * first

      const { data } = await graphService.keysByLocks({
        locks: lockAddresses,
        expireTimestamp,
        expiration,
        first,
        skip,
        search: query,
        filterKey,
      })

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
          if (data?.locks) {
            const storedMetadata = await getKeysMetadata(data?.locks ?? [])
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

      setMembers(members ?? [])
      if (members.length > 0) {
        setHasNextPage(Object.keys(members).length === first)
      }
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setMembers([])
      ToastHelper.error('There is some unexpected issue, please try again')
    }
  }

  const getMembersCount = async () => {
    const {
      data: { activeKeys },
    } = await graphService.keysCount(lockAddresses)

    const totalsPromise = await Promise.all(
      lockAddresses.map((lockAddress) =>
        web3Service.numberOfOwners(lockAddress, network)
      )
    )

    // get total for every locks
    const locksActiveList: number[] = activeKeys.map(
      (lock: any) => lock?.keys?.length
    )
    const locksTotalList: number[] = totalsPromise.map((total: BigNumber) =>
      ethers.BigNumber.from(total).toNumber()
    )
    // return active/total count as sum of every active/total lock count
    setMembersCount({
      active: locksActiveList.reduce((acc, curr) => acc + curr),
      total: locksTotalList.reduce((acc, curr) => acc + curr),
    })
  }
  /**
   * When the keyHolders object changes, load the metadata
   */
  useEffect(() => {
    loadMembers()
  }, [
    JSON.stringify(lockAddresses),
    viewer,
    page,
    query,
    filterKey,
    expiration,
  ])

  useEffect(() => {
    getMembersCount()
  }, [])

  const list: any = Object.values(members)
  const columns = generateColumns(list)
  return {
    loading,
    list,
    columns,
    hasNextPage,
    isLockManager,
    loadMembers,
    membersCount,
  }
}

export default useMembers
