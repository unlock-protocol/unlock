import { useQuery } from 'react-query'
import axios from 'axios'

const subgraphApi = axios.create({
  responseType: 'json',
})

const subgraphConfig = (upToDate: number) => `{
  lockStats(id: "Unlock") {
    totalLocksDeployed
    totalKeysSold
  }
  unlockDailyDatas(first: 1000, where: {
    id_gt: ${upToDate}
  }) {
    id
    totalLockDeployed
    totalKeysSold
    activeLocks
    grossNetworkProduct
  }
}`

export async function getSubgraph4GNP(subgraphUrl: string, upToDate?: number) {
  const { data } = await subgraphApi.post(`${subgraphUrl}`, {
    query: subgraphConfig(upToDate),
  })
  return data
}

export function useSubgraph4GNP(subgraphUrl: string, upToDate?: number) {
  return useQuery(['subgraphData4GNP', subgraphUrl, upToDate], () =>
    getSubgraph4GNP(subgraphUrl, upToDate)
  )
}
