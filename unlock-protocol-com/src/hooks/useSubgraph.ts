import { useQuery } from 'react-query'
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

export async function getSubgraph4GNP(subgraphUrl: string, upToDate?: number) {
  const { data } = await subgraphApi.post(`${subgraphUrl}`, {
    query: subgraphConfig(upToDate),
  })
  if (data?.data?.unlockDailyDatas) {
    // Add missing datapoints (if no event was triggered on a day, then it's not in the list!)
    const lastDayData =
      data?.data?.unlockDailyDatas[data?.data?.unlockDailyDatas.length - 1]
    const lastDay = parseInt(lastDayData.id, 10)
    const today = Math.floor(new Date().getTime() / (1000 * 24 * 60 * 60))
    if (lastDay < today) {
      data?.data?.unlockDailyDatas.push({
        id: today.toString(),
        totalLockDeployed: lastDayData.totalLockDeployed,
        totalKeysSold: lastDayData.totalKeysSold,
        activeLocks: lastDayData.activeLocks,
        grossNetworkProduct: lastDayData.grossNetworkProduct,
      })
    }
    data?.data?.unlockDailyDatas
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
      .forEach((day, i) => {
        if (i > 0) {
          const dayNumber = parseInt(day.id, 10)
          const dayBefore = parseInt(data.data.unlockDailyDatas[i - 1].id, 10)
          for (let j = dayBefore + 1; j < dayNumber; j++) {
            data.data.unlockDailyDatas.push({
              id: j.toString(),
              totalLockDeployed:
                data.data.unlockDailyDatas[i - 1].totalLockDeployed,
              totalKeysSold: data.data.unlockDailyDatas[i - 1].totalKeysSold,
              activeLocks: [],
              grossNetworkProduct:
                data.data.unlockDailyDatas[i - 1].grossNetworkProduct,
            })
          }
        }
      })

    data.data.unlockDailyDatas = data?.data?.unlockDailyDatas.sort(
      (a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)
    )
  }

  return data
}
