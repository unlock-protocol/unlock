import { useWalletService } from '~/utils/withWalletService'
import { useStorageService } from '~/utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { useEffect, useState } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import networks from '@unlock-protocol/networks'
import GraphService from '~/services/graphService'
import { paginate } from '~/utils/pagination'

type KeyItem = {
  token: string
  lockName: string
  expiration: string
  keyholderAddress: string
  lockAddress: string
  [key: string]: any
}

export const useKeys = ({
  viewer,
  network,
  locks = [],
  filters,
}: {
  viewer: string
  network: number
  locks: string[]
  filters: { [key: string]: any }
}) => {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()

  const [keys, setKeys] = useState<KeyItem[]>([])
  const [allKeys, setAllKeys] = useState<KeyItem[]>([])
  const [keysCount, setKeysCount] = useState<{ active: number; total: number }>(
    {
      active: 0,
      total: 0,
    }
  )
  const [hasNextPage, setNextPage] = useState(false)
  const [lockManagerMapping, setLockManagerMapping] = useState<{
    [lockAddress: string]: boolean
  }>({})

  useEffect(() => {
    const getLockManagerStatus = async () => {
      const lockManagerPromise = locks?.map((lock: string) =>
        web3Service.isLockManager(lock, viewer!, network!)
      )
      const status = await Promise.all(lockManagerPromise)

      let mapping = {}
      locks?.map(
        (lock: string, index: number) =>
          (mapping = {
            ...mapping,
            [lock.toLowerCase()]: status[index] ?? false, // set lockManager status or false is value is not valid
          })
      )
      setLockManagerMapping(mapping)
    }
    getLockManagerStatus()
  }, [viewer, locks, network, web3Service])

  const getKeysCount = async () => {
    const graphService = new GraphService()
    graphService.connect(networks[network]!.subgraphURI!)
    const {
      data: { activeKeys },
    } = await graphService.keysCount(locks)

    const locksTotalList = await Promise.all(
      locks.map((lockAddress) =>
        web3Service.numberOfOwners(lockAddress, network)
      )
    )

    // get total for every locks
    const locksActiveList: number[] = activeKeys.map(
      (lock: any) => lock?.keys?.length
    )
    const active = locksActiveList.reduce((acc, curr) => acc + curr)
    const total = locksTotalList.reduce((acc, curr) => acc + curr)
    // return active/total count as sum of every active/total lock count
    setKeysCount({ active, total })
  }

  const getKeys = async () => {
    await storageService.loginPrompt({
      walletService,
      address: viewer!,
      chainId: network!,
    })

    let keys: KeyItem[] = []
    const locksPromise = locks?.map((lockAddress: string) =>
      storageService.getKeys({
        lockAddress,
        filters: {
          ...filters,
          page: 0,
        },
        network: network!,
      })
    )
    const results = await Promise.all(locksPromise)
    results.forEach((result) => {
      keys = [...keys, ...result]
    })
    setAllKeys(keys)
    const { items, hasNextPage } = paginate({
      items: keys,
      page: filters.page,
      itemsPerPage: 30,
    })
    setKeys(items)
    setNextPage(hasNextPage)
    await getKeysCount()
    return Promise.resolve(items)
  }

  const columns = generateColumns(keys)

  return {
    getKeys,
    allKeys,
    columns,
    hasNextPage,
    getKeysCount,
    lockManagerMapping,
    keysCount,
  }
}
