import { useEffect, useState } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'

export const useKeys = ({
  viewer,
  network,
  locks,
}: {
  viewer: string
  network: number
  locks: string[]
}) => {
  const web3Service = useWeb3Service()
  // in case of multiple locks lets keep track where the user has lockManager status
  const [lockManagerMapping, setLockManagerMapping] = useState<{
    [lockAddress: string]: boolean
  }>()

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

  return {
    lockManagerMapping,
  }
}
