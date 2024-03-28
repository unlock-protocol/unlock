import { Button } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import numeral from 'numeral'
import { useQuery } from '@tanstack/react-query'
import { networks } from '@unlock-protocol/networks'
import { getSubgraph4GNP } from 'src/hooks/useSubgraph'
import { utils } from 'ethers'

// sections components
import { Overview } from './sections/overview'
import { GNP } from './sections/gnp'
import { HistoricalChart } from './sections/chart'

type INetworkSubgraph = {
  lockStats: {
    totalKeysSold: string
    totalLocksDeployed: string
  }
  unlockDailyDatas: {
    activeLocks: string[]
    id: number
    totalKeysSold: string
    totalLockDeployed: string
  }[]
}

type IGNPSum = {
  name: string
  gnpSum: number
}

const filters = ['7D', '1M', '1Y', 'All']
type IFilter = {
  period: string
  selectedNetwork?: string | undefined
}

function filterData({ subgraphData, filter }) {
  const { period, selectedNetwork } = filter

  const currentDay = Math.round(new Date().getTime() / 86400000)
  const days = {
    '7D': 8,
    '1M': 31,
    '1Y': 360,
    ALL: 0,
  }[period]
  const upperLimit = currentDay - days

  const filterTime = ({ name, data }) => {
    console.log({ name, data })
    return {
      name,
      data: {
        ...data,
        unlockDailyDatas: period
          ? data.unlockDailyDatas.filter(({ id }) => id >= upperLimit)
          : data.unlockDailyDatas,
      },
    }
  }

  // aggregate data
  console.log(selectedNetwork)
  if (!selectedNetwork || selectedNetwork === 'ALL') {
    return subgraphData.map((row) => {
      filterTime(row)
    })
  } else {
    return subgraphData
      .filter(({ name }) =>
        selectedNetwork ? name === filter.selectedNetwork : true
      )
      .map(filterTime)
  }
}

function DateFilter({
  filter,
  setFilter,
}: {
  filter: IFilter
  setFilter: (value: IFilter) => void
}) {
  return (
    <div className="flex flex-row items-center justify-center gap-4 p-2 bg-white rounded-md">
      {filters.map((item, index) => (
        <div
          className="cursor-pointer"
          onClick={() => setFilter({ ...filter, period: item })}
          key={index}
        >
          <p
            className={`text-gray font-lg px-3 py-1 ${
              filter.period === item
                ? 'bg-black text-white rounded-md'
                : 'bg-white'
            }`}
          >
            {item}
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
    <div className="flex flex-wrap justify-between gap-2">
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
        {Object.keys(networks)
          .map((id) => networks[id])
          .filter(({ isTestNetwork }) => !isTestNetwork)
          .map(({ name }, index) => (
            <option value={name} key={index}>
              {name}
            </option>
          ))}
      </select>
    </div>
  )
}

export function State() {
  const currentDay = Math.round(new Date().getTime() / 86400000)
  const [subgraphData, setSubgraphData] = useState<any[]>([])
  const [filter, setFilter] = useState<IFilter>({ period: '7D' })
  const [filteredData, setFilteredData] = useState<INetworkSubgraph[]>([])

  // get subgraphData
  useEffect(() => {
    const run = async () => {
      const subgraphData = await Promise.all(
        Object.keys(networks).map(async (key) => {
          if (!networks[key].isTestNetwork) {
            const { data } = await getSubgraph4GNP(
              networks[key].subgraph.endpoint,
              currentDay - 1030 // why?
            )
            return { name: networks[key].name, data }
          }
        })
      )
      setSubgraphData(subgraphData.filter((item) => item && item.data))
    }
    run()
  }, [currentDay])

  // filter data properly
  useEffect(() => {
    setFilteredData(filterData({ filter, subgraphData }))
  }, [filter, subgraphData])

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4">
          <h1 className="space-y-8 text-center heading"> State of Unlock </h1>
        </div>
        <div className="space-y-4">
          <p className="space-y-1 text-2xl font-bold">Overview</p>
          <Overview subgraphData={subgraphData} />
        </div>
        <div className="space-y-2">
          <p className="space-y-1 text-2xl font-bold">Activity over time</p>
          <NetworkPicker filter={filter} setFilter={setFilter} />
          <DateFilter filter={filter} setFilter={setFilter} />
        </div>
        <div className="space-y-2">
          {filteredData.length && (
            <HistoricalChart subgraphData={filteredData} filter={filter} />
          )}
        </div>
        <div className="space-y-2">
          <p className="space-y-1 text-2xl font-bold">Gross Network Product</p>
          {/* <GNP /> */}
        </div>
      </div>
    </div>
  )
}
