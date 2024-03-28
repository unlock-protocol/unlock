import React, { useEffect, useState } from 'react'
import { networks } from '@unlock-protocol/networks'
import { getSubgraph4GNP } from 'src/hooks/useSubgraph'

// sections components
import { Overview } from './sections/overview'
import { GNP } from './sections/gnp'
import { HistoricalChart } from './sections/chart'

type IDailyStats = {
  name: string
  id: number
  date: Date
  activeLocks: string[]
  totalKeysSold: string
  totalLockDeployed: string
}

type ILockStats = {
  name: string
  id: number
  totalKeysSold: string
  totalLocksDeployed: string
  activeLocks: number
}

type IFilter = {
  period: number
  selectedNetwork?: number | undefined
}

const filters = [
  { label: 'ALL', period: 1000 },
  { label: '1 Month', period: 30 },
  { label: '6 Months', period: 180 },
  { label: '1 Year', period: 365 },
]

function isWithin(date, days) {
  const toTest = new Date(date)
  const now = new Date()
  const fewDaysAgo = new Date()
  fewDaysAgo.setDate(now.getDate() - days)
  return (
    fewDaysAgo.getTime() <= toTest.getTime() && toTest.getTime() < now.getTime()
  )
}

function filterData({ dailyStats, filter }) {
  const { period, selectedNetwork } = filter
  return dailyStats.filter(({ name, date }) =>
    isWithin(date, period) && (!selectedNetwork || selectedNetwork === 'ALL')
      ? true
      : name === selectedNetwork
  )
}

const supportedNetworks = Object.keys(networks)
  .map((id) => networks[id])
  .filter(({ isTestNetwork, id }) => !isTestNetwork && id)
  .map(({ name, chain, id, subgraph }) => ({
    name,
    chain,
    id,
    subgraphURI: subgraph.endpoint,
  }))

function DateFilter({
  filter,
  setFilter,
}: {
  filter: IFilter
  setFilter: (value: IFilter) => void
}) {
  return (
    <div className="flex flex-row items-center justify-center gap-4 p-2 bg-white rounded-md">
      {filters.map(({ label, period }, index) => (
        <div
          className="cursor-pointer"
          onClick={() => setFilter({ ...filter, period })}
          key={index}
        >
          <p
            className={`text-gray font-lg px-3 py-1 ${
              filter.period === period
                ? 'bg-black text-white rounded-md'
                : 'bg-white'
            }`}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

function NetworkPicker({
  filter,
  setFilter,
}: {
  filter: IFilter
  setFilter: (value: IFilter) => void
}) {
  return (
    <select
      id="network"
      className="px-4 text-black bg-white border-none rounded-md w-96"
      value={filter.selectedNetwork}
      onChange={(e) => {
        setFilter({ ...filter, selectedNetwork: e.target.value })
      }}
    >
      <option value="ALL" key="ALL">
        All
      </option>
      {supportedNetworks.map(({ name, chain }, index) => (
        <option value={chain} key={index}>
          {name}
        </option>
      ))}
    </select>
  )
}

export function State() {
  const currentDay = Math.round(new Date().getTime() / 86400000)
  const [dailyStats, setDailyStats] = useState<IDailyStats[]>([])
  const [lockStats, setLockStats] = useState<ILockStats[]>([])
  const [filter, setFilter] = useState<IFilter>({ period: 1000 })
  const [filteredData, setFilteredData] = useState<IDailyStats[]>([])

  // get data from all subgraphs
  useEffect(() => {
    const run = async () => {
      const allData = await Promise.all(
        supportedNetworks.map(async ({ name, id, subgraphURI }) => {
          const data = await getSubgraph4GNP(subgraphURI, currentDay - 1000)
          return {
            name,
            id,
            data,
          }
        })
      )

      const dailyStats = allData.reduce(
        (obj, { data: { unlockDailyDatas }, name, id }) => {
          unlockDailyDatas.forEach(({ date, ...datum }, i) => {
            obj = [
              ...obj,
              {
                date,
                name,
                id,
                // compute locks per day
                lockDeployed: i
                  ? datum.totalLockDeployed -
                    unlockDailyDatas[i - 1].totalLockDeployed
                  : 0,
                // compute keys per day
                keySold: i
                  ? datum.totalKeysSold - unlockDailyDatas[i - 1].totalKeysSold
                  : 0,
                ...datum,
              },
            ]
          })
          return obj
        },
        []
      )
      setDailyStats(dailyStats)

      const lockStats = allData.map(
        ({ data: { lockStats, unlockDailyDatas }, name, id }) => ({
          name,
          id,
          ...lockStats,
          activeLocks: unlockDailyDatas
            .map(({ activeLocks }) => activeLocks)
            .reduce((pv, a) => pv + a, 0),
        })
      )
      setLockStats(lockStats)
    }
    run()
  }, [currentDay])

  // filter data properly
  useEffect(() => {
    setFilteredData(filterData({ filter, dailyStats }))
  }, [filter, dailyStats])

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4">
          <h1 className="space-y-8 text-center heading"> State of Unlock </h1>
        </div>
        <div className="space-y-4">
          <p className="space-y-1 text-2xl font-bold">Overview</p>
          <Overview lockStats={lockStats} />
        </div>
        <div className="space-y-2">
          <p className="space-y-1 text-2xl font-bold">Activity over time</p>
          <div className="flex flex-wrap space-y-2 justify-between gap-2">
            <NetworkPicker filter={filter} setFilter={setFilter} />
            <DateFilter filter={filter} setFilter={setFilter} />
          </div>
        </div>
        <div className="space-y-2 m-8">
          {filteredData.length && (
            <HistoricalChart dailyStats={filteredData} filter={filter} />
          )}
        </div>
        <div className="space-y-2">
          <p className="space-y-1 text-2xl font-bold">Gross Network Product</p>
          <GNP />
        </div>
      </div>
    </div>
  )
}
