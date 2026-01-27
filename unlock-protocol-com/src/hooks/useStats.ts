import { useEffect, useState } from 'react'
import { networks } from '@unlock-protocol/networks'
import { getSubgraph4GNP } from './useSubgraph'

type ILockStats = {
  name: string
  id: number
  totalKeysSold: string
  totalLocksDeployed: string
  activeLocks: number
}

export function useStats() {
  const [lockStats, setLockStats] = useState<ILockStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentDay = Math.round(new Date().getTime() / 86400000)

    const supportedNetworks = Object.keys(networks)
      .map((id) => networks[id])
      .filter(({ isTestNetwork, id }) => !isTestNetwork && id)
      .map(({ name, chain, id, subgraph }) => ({
        name,
        chain,
        id,
        subgraphURI: subgraph.endpoint,
      }))

    const run = async () => {
      try {
        const allData = await Promise.all(
          supportedNetworks.map(async ({ name, id, chain, subgraphURI }) => {
            const data = await getSubgraph4GNP(subgraphURI, currentDay - 1000)
            return {
              name,
              id,
              data,
              chain,
            }
          })
        )

        const lockStats = allData.map(
          ({ data: { lockStats, unlockDailyDatas }, name, id }) => ({
            name,
            id,
            ...lockStats,
            activeLocks: unlockDailyDatas
              .filter(({ date }) => {
                const toTest = new Date(date)
                const now = new Date()
                const fewDaysAgo = new Date()
                fewDaysAgo.setDate(now.getDate() - 30)
                return (
                  fewDaysAgo.getTime() <= toTest.getTime() &&
                  toTest.getTime() < now.getTime()
                )
              })
              .map(({ activeLocks }) => activeLocks)
              .reduce((pv, a) => pv + a, 0),
          })
        )
        setLockStats(lockStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [])

  const totalLocksDeployed = lockStats.reduce(
    (pv, b) => pv + (parseInt(b?.totalLocksDeployed) || 0),
    0
  )
  const totalKeysSold = lockStats.reduce(
    (pv, b) => pv + (parseInt(b?.totalKeysSold) || 0),
    0
  )
  const activeLocks = lockStats.reduce((pv, b) => pv + (b?.activeLocks || 0), 0)

  return {
    totalLocksDeployed,
    totalKeysSold,
    activeLocks,
    isLoading,
  }
}
