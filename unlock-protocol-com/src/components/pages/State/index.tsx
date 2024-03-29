import React, { useEffect, useState } from 'react'
import { networks } from '@unlock-protocol/networks'
import { getSubgraph4GNP } from 'src/hooks/useSubgraph'
import * as Plot from '@observablehq/plot'

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
  selectedNetworks: string[]
}

interface IViewFilter {
  label: string
  value: string
  cumulative?: boolean
}

const views = [
  {
    label: 'Locks deployed',
    value: 'lockDeployed',
  },
  {
    label: 'Locks active',
    value: 'activeLocks',
  },
  {
    label: 'Keys',
    value: 'keySold',
  },
  {
    label: 'Locks deployed (cumulative)',
    value: 'lockDeployed',
    cumulative: true,
  },
  {
    label: 'Keys (cumulative)',
    value: 'keySold',
    cumulative: true,
  },
]

function ViewFilter({
  viewFilter,
  setViewFilter,
}: {
  viewFilter: IViewFilter
  setViewFilter: (value: IViewFilter) => void
}) {
  return (
    <div className="flex flex-row items-center justify-center gap-4 m-2 p-2 rounded-md">
      {views.map((view, index) => (
        <div
          className="cursor-pointer"
          onClick={() => setViewFilter(view)}
          key={index}
        >
          <p
            className={`text-gray font-lg px-3 py-1 ${
              viewFilter.value === view.value
                ? 'bg-black text-white rounded-md'
                : 'bg-white'
            }`}
          >
            {view.label}
          </p>
        </div>
      ))}
    </div>
  )
}

const timeFilters = [
  { label: '1 Month', period: 30 },
  { label: '6 Months', period: 180 },
  { label: '1 Year', period: 365 },
  { label: 'ALL', period: 1000 },
]

const supportedNetworks = Object.keys(networks)
  .map((id) => networks[id])
  .filter(({ isTestNetwork, id }) => !isTestNetwork && id)
  .map(({ name, chain, id, subgraph }) => ({
    name,
    chain,
    id,
    subgraphURI: subgraph.endpoint,
  }))

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
  const { period, selectedNetworks } = filter
  return dailyStats.filter(
    ({ chain, date }) =>
      isWithin(date, period) &&
      (!selectedNetworks.length ? true : selectedNetworks.includes(chain))
  )
}

function DateFilter({
  filter,
  setFilter,
}: {
  filter: IFilter
  setFilter: (value: IFilter) => void
}) {
  return (
    <div className="flex flex-row items-center justify-center gap-4 bg-white rounded-md">
      {timeFilters.map(({ label, period }, index) => (
        <div
          className="cursor-pointer"
          onClick={() => setFilter({ ...filter, period })}
          key={index}
        >
          <p
            className={`text-gray px-3 py-1 ${
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

function NetworkRadioPicker({
  filter,
  setFilter,
}: {
  filter: IFilter
  setFilter: (value: IFilter) => void
}) {
  const handleOnChange = (selectedChain) => {
    const updatedSelectedNetworks = filter.selectedNetworks.includes(
      selectedChain
    )
      ? filter.selectedNetworks.filter((chain) => chain !== selectedChain)
      : [...filter.selectedNetworks, selectedChain]
    setFilter({ ...filter, selectedNetworks: updatedSelectedNetworks })
  }

  const color = Plot.scale({
    color: {
      scheme: 'Tableau10',
      domain: supportedNetworks.map((_, i) => i),
    },
  })

  return (
    <div className="flex flex-row items-center text-xs justify-center">
      {supportedNetworks.map(({ name, chain }, index) => (
        <label className="mr-4" key={index}>
          <input
            className="mr-2"
            style={{ backgroundColor: color.apply(index) }}
            key={index}
            type="checkbox"
            value={chain}
            checked={filter.selectedNetworks.includes(chain)}
            onChange={() => handleOnChange(chain)}
          />
          {name}
        </label>
      ))}
    </div>
  )
}

export function State() {
  const currentDay = Math.round(new Date().getTime() / 86400000)
  const [dailyStats, setDailyStats] = useState<IDailyStats[]>([])
  const [lockStats, setLockStats] = useState<ILockStats[]>([])
  const [filter, setFilter] = useState<IFilter>({
    period: 1000,
    selectedNetworks: supportedNetworks.map(({ chain }) => chain),
  })
  const [viewFilter, setViewFilter] = useState<IViewFilter>(views[1])
  const [filteredData, setFilteredData] = useState<IDailyStats[]>([])

  // get data from all subgraphs
  useEffect(() => {
    const run = async () => {
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

      const dailyStats = allData.reduce(
        (obj, { data: { unlockDailyDatas }, name, id, chain }) => {
          unlockDailyDatas.forEach(({ date, ...datum }, i) => {
            obj = [
              ...obj,
              {
                date,
                name,
                chain,
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
            .filter(({ date }) => isWithin(date, 30)) // last 30 days
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
        <div className="space-y-4 mt-16">
          <Overview lockStats={lockStats} />
        </div>
        <div className="space-y-2 mt-16">
          <p className="space-y-1 text-center text-2xl font-bold">
            Activity over time
          </p>
          <div className="flex flex-wrap space-y-2 justify-between gap-2">
            <ViewFilter viewFilter={viewFilter} setViewFilter={setViewFilter} />
            <DateFilter filter={filter} setFilter={setFilter} />
          </div>
          {filteredData.length && (
            <HistoricalChart
              dailyStats={filteredData}
              filter={filter}
              supportedNetworks={supportedNetworks}
              viewFilter={viewFilter}
            />
          )}
        </div>
        <div className="space-y-2">
          <NetworkRadioPicker filter={filter} setFilter={setFilter} />
        </div>
        <div className="space-y-2 mt-16">
          <p className="space-y-1 text-2xl font-bold m-8">
            Gross Network Product
          </p>
          <GNP />
        </div>
      </div>
    </div>
  )
}
