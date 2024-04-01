import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const subgraphApi = axios.create({
  responseType: 'json',
})

// TODO: support pagination!
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

const parseLockStats = ({ totalKeysSold, totalLocksDeployed }) => ({
  totalKeysSold: parseInt(totalKeysSold),
  totalLocksDeployed: parseInt(totalLocksDeployed),
})

const parseDailyData = ({
  id,
  totalLockDeployed,
  totalKeysSold,
  activeLocks,
  grossNetworkProduct,
}) => ({
  date: new Date(parseInt(id) * 86400000),
  totalLockDeployed: parseInt(totalLockDeployed),
  totalKeysSold: parseInt(totalKeysSold),
  activeLocks: activeLocks.length,
  grossNetworkProduct,
})

export async function getSubgraph4GNP(subgraphUrl: string, upToDate?: number) {
  const {
    data: { data },
  } = await subgraphApi.post(`${subgraphUrl}`, {
    query: subgraphConfig(upToDate),
  })

  return {
    ...data,
    unlockDailyDatas: data.unlockDailyDatas.map(parseDailyData),
    lockStats: parseLockStats(data.lockStats),
  }
}
