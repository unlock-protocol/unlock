import { useWalletService } from '~/utils/withWalletService'
import { useStorageService } from '~/utils/withStorageService'
import { generateColumns } from '../utils/metadataMunging'
import { useState } from 'react'

export const useKeys = ({
  lockAddress = [],
  viewer,
  network,
  filters,
}: {
  lockAddress: string[]
  viewer: string
  network: number
  filters: { [key: string]: any }
}) => {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const [keys, setKeys] = useState<any[]>([])

  const getKeys = async () => {
    await storageService.loginPrompt({
      walletService,
      address: viewer!,
      chainId: network!,
    })

    let keys: any[] = []
    const locksPromise = lockAddress?.map((lockAddress: string) =>
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
  }
}
