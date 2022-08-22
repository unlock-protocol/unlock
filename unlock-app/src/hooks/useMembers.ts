import { useEffect, useState, useContext } from 'react'
import { expirationAsDate } from '../utils/durations'
import { useWalletService } from '../utils/withWalletService'
import { useStorageService } from '../utils/withStorageService'
import { MemberFilter } from '../unlockTypes'
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
        [key?.userAddress?.toLowerCase()]: {
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
  const web3Service = useContext(Web3ServiceContext)
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

  const getMembersCount = async () => {
    const {
      data: { activeKeys },
    } = await graphService.keysCount(lockAddresses)

    const locksTotalList = await Promise.all(
      lockAddresses.map((lockAddress) =>
        web3Service.numberOfOwners(lockAddress, network)
      )
    )

    // get total for every locks
    const locksActiveList: number[] = activeKeys.map(
      (lock: any) => lock?.keys?.length
    )
    // return active/total count as sum of every active/total lock count
    setMembersCount({
      active: locksActiveList.reduce((acc, curr) => acc + curr),
      total: locksTotalList.reduce((acc, curr) => acc + curr),
    })
  }

  useEffect(() => {
    getMembersCount()
  }, [])

  return {
    loading,
    //columns,
    hasNextPage,
    isLockManager,
    membersCount,
  }
}

export default useMembers
