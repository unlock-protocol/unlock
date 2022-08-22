import { useWalletService } from '~/utils/withWalletService'
import { useStorageService } from '~/utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { useContext, useState } from 'react'
import { GraphServiceContext } from '~/utils/withGraphService'
import { useWeb3Service } from '~/utils/withWeb3Service'

type KeyItem = {
  token: string
  lockName: string
  expiration: string
  keyholderAddress: string
  lockAddress: string
  [key: string]: any
}

export const useKeys = ({
  locks = [],
  viewer,
  network,
  filters,
}: {
  locks: string[]
  viewer: string
  network: number
  filters: { [key: string]: any }
}) => {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const graphService = useContext(GraphServiceContext)
  const web3Service = useWeb3Service()

  const [keys, setKeys] = useState<KeyItem[]>([])
  const [hasNextPage] = useState(false) // todo: restore pagination

  const getKeysCount = async () => {
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
    return {
      active,
      total,
    }
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
        filters,
        network: network!,
      })
    )
    const results = await Promise.all(locksPromise)
    results.forEach((result) => {
      keys = [...keys, ...result]
    })
    setKeys(keys)
    return Promise.resolve(keys)
  }

  const columns = generateColumns(keys)

  return {
    getKeys,
    columns,
    hasNextPage,
    getKeysCount,
  }
}
