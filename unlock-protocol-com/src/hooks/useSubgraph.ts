import { useQuery } from 'react-query'
import axios from 'axios'

const subgraphApi = axios.create({
  baseURL: 'https://api.studio.thegraph.com/query/37457/test-unlock/v0.0.8/',
  responseType: 'json',
})

const subgraphConfig = `{
  locks {
    id
    address
    name
    symbol
    lastKeyMintedAt
  }
  lockStats(id:"1") {
    totalLocksDeployed
    totalKeysSold
  }
  lockDayDatas {
    id
    lockDeployed
    activeLocks
    keysSold
  }
}`

async function getSubgraph4GNP(subgraphUrl: string) {
  const { data } = await subgraphApi.post(`${subgraphUrl}`, {
    query: subgraphConfig,
  })
  return data
}

export function useSubgraph4GNP(subgraphUrl: string) {
  return useQuery(['subgraphData4GNP', subgraphUrl], () =>
    getSubgraph4GNP(subgraphUrl)
  )
}
