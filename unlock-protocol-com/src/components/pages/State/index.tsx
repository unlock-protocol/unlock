import { Button } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { ActiveLock, Lock, Key } from '../../icons'
import numeral from 'numeral'
import { useQuery } from 'react-query'
import dynamic from 'next/dynamic'
import { networks } from '@unlock-protocol/networks'

import { getGNPs } from '../../../utils/apiRequest'
import { getSubgraph4GNP } from 'src/hooks/useSubgraph'
import { IconBaseProps } from 'react-icons'
import { utils } from 'ethers'

const CryptoIconComponent = dynamic(() => import('react-crypto-icons'), {
  ssr: false,
})

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CryptoIconProps {
  symbol: string
  size?: number
}

type IOverView = {
  Icon: (props: IconBaseProps) => JSX.Element
  value: number
  title: string
  description: string
}

type ISeries = {
  name: string
  data: number[]
}

type INetworkSubgraph = {
  lockStats: {
    totalKeysSold: string
    totalLocksDeployed: string
  }
  unlockDailyDatas: {
    activeLocks: string[]
    id: number
    keysSold: string
    lockDeployed: string
  }[]
}

type IXaxis = {
  categories: string[]
}

type IGNPSum = {
  name: string
  gnpSum: number
}

const CryptoIcon = ({ symbol, size = 20 }: CryptoIconProps) => (
  <CryptoIconComponent name={symbol?.toLowerCase()} size={size} />
)

const filters = ['1D', '7D', '1M', '1Y', 'All']

function RenderChart({ series, xaxis }: { series: any; xaxis?: any }) {
  const chartOptions = {
    options: {
      chart: { zoom: { enabled: false } },
      stroke: {
        curve: 'smooth' as 'smooth' | 'straight' | 'stepline',
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: xaxis,
      yaxis: [
        { show: false, logarithmic: true },
        { show: false },
        { show: false },
      ],
      tooltip: {
        y: [
          {
            title: {
              formatter: (val) => val,
            },
          },
          {
            title: {
              formatter: (val) => val,
            },
          },
          {
            title: {
              formatter: (val) => val,
            },
          },
        ],
      },
      grid: {
        borderColor: '#f1f1f1',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
    },
  }

  return (
    <div className="w-full h-80">
      <ReactApexChart
        options={chartOptions.options}
        series={series}
        type="line"
        height={320}
      />
    </div>
  )
}

function DateFilter({
  filter,
  setFilter,
}: {
  filter: string
  setFilter: (value: string) => void
}) {
  return (
    <div className="gap-4 flex flex-row items-center justify-center rounded-md bg-white p-2">
      {filters.map((item, index) => (
        <div
          className="cursor-pointer"
          onClick={() => setFilter(item)}
          key={index}
        >
          <p
            className={`text-gray font-lg px-3 py-1 ${
              filter === item ? 'bg-black text-white rounded-md' : 'bg-white'
            }`}
          >
            {item}
          </p>
        </div>
      ))}
    </div>
  )
}

function CalcActiveLocksCount(graphData: any[]) {
  const currentDay = Math.round(new Date().getTime() / 86400000)
  const unlockDailyDatas = graphData
    .map((item) => item.data.unlockDailyDatas)
    .flatMap((data) => data)
  const activeLockList = unlockDailyDatas
    .filter(
      (dailyData) =>
        dailyData.id > currentDay - 30 && dailyData.id <= currentDay
    )
    .map((item) => item.activeLocks)
    .flatMap((data) => data)
  return [...new Set(activeLockList)].length
}

function CalcRenderData(
  graphData: INetworkSubgraph,
  timestampArray: number[],
  flag: 0 | 1 | 2,
  filter: string
) {
  return timestampArray.map((dayId) => {
    // const interval = ['1D', '7D', '1M'].includes(filter) ? 1 : 30
    const dayDatas = graphData.unlockDailyDatas.filter(
      (item) => item.id >= dayId - 1 && item.id < dayId
    )
    if (flag === 0) return dayDatas.reduce((x, y) => x + Number(y.keysSold), 0)
    if (flag === 1) {
      const lastMonthActiveLocks = graphData.unlockDailyDatas
        .filter((item) => item.id > dayId - 30 && item.id <= dayId)
        .map((item) => item.activeLocks)
        .flatMap((lock) => lock)
      return [...new Set(lastMonthActiveLocks)].length
    }
    if (flag === 2)
      return dayDatas.reduce((x, y) => x + Number(y.lockDeployed), 0)
  })
}

export function State() {
  const currentDay = Math.round(new Date().getTime() / 86400000)
  const [subgraphData, setSubgraphData] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('1Y')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gnpValues, setGNPValues] = useState<any[]>([])
  const [overViewData, setOverViewData] = useState<IOverView[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    Object.keys(networks)[0]
  )
  const [selectedNetworkSubgraphData, setSelectedNetworkSubgraphData] =
    useState<INetworkSubgraph | undefined>(undefined)
  const [series, setSeries] = useState<ISeries[]>([])
  const [xaxis, setXaxis] = useState<IXaxis | undefined>(undefined)
  const [gnpTotalValueByNetwork, setGnpTotalValueByNetwork] = useState<
    IGNPSum[]
  >([])
  const [gnpPByNetworks, setGNPPByNetworks] = useState<any[]>([])

  useEffect(() => {
    if (selectedNetworkSubgraphData) {
      let xAxisLabels
      let timestampArray
      switch (filter) {
        case '1D': {
          xAxisLabels = [...Array(2).keys()].reverse().map((key) => {
            const cur = new Date()
            return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
              'default',
              { dateStyle: 'short' }
            )
          })
          timestampArray = [...Array(2).keys()].reverse().map((key) => {
            const cur = new Date()
            return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
          })
          break
        }
        case '7D': {
          xAxisLabels = [...Array(7).keys()].reverse().map((key) => {
            const cur = new Date()
            return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
              'default',
              { dateStyle: 'short' }
            )
          })
          timestampArray = [...Array(7).keys()].reverse().map((key) => {
            const cur = new Date()
            return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
          })
          break
        }
        case '1M': {
          xAxisLabels = [...Array(30).keys()].reverse().map((key) => {
            const cur = new Date()
            return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
              'default',
              { dateStyle: 'short' }
            )
          })
          timestampArray = [...Array(30).keys()].reverse().map((key) => {
            const cur = new Date()
            return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
          })
          break
        }
        case '1Y': {
          xAxisLabels = [...Array(12).keys()].reverse().map((key) => {
            const cur = new Date()
            return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
              'default',
              { dateStyle: 'short' }
            )
          })
          timestampArray = [...Array(12).keys()].reverse().map((key) => {
            const cur = new Date()
            return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
          })
          break
        }
        case 'All': {
          xAxisLabels = [...Array(36).keys()].reverse().map((key) => {
            const cur = new Date()
            return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
              'default',
              { dateStyle: 'short' }
            )
          })
          timestampArray = [...Array(36).keys()].reverse().map((key) => {
            const cur = new Date()
            return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
          })
          break
        }
      }

      setXaxis({
        categories: xAxisLabels,
      })
      setSeries([
        {
          name: 'Keys (Memberships) Minted',
          data: CalcRenderData(
            selectedNetworkSubgraphData,
            timestampArray,
            0,
            filter
          ),
        },
        {
          name: 'Active Locks',
          data: CalcRenderData(
            selectedNetworkSubgraphData,
            timestampArray,
            1,
            filter
          ),
        },
        {
          name: 'Locks Deployed',
          data: CalcRenderData(
            selectedNetworkSubgraphData,
            timestampArray,
            2,
            filter
          ),
        },
      ])
    }
  }, [selectedNetworkSubgraphData])

  useEffect(() => {
    const run = async () => {
      const values = await getGNPs()
      values.sort((a, b) => {
        if (a.total < b.total) return 1
        if (a.total > b.total) return -1
        return 0
      })
      setGNPValues(values)
      setIsLoading(false)
    }
    run()
  }, [])

  useEffect(() => {
    const run = async () => {
      if (selectedNetwork === 'ALL') {
        const subgraphData = await Promise.all(
          Object.keys(networks).map(async (key) => {
            if (!networks[key].isTestNetwork) {
              const { data } = await getSubgraph4GNP(
                networks[key].subgraph.endpointV2,
                currentDay - 1030
              )
              return data
            }
          })
        )
        setSelectedNetworkSubgraphData(
          subgraphData
            .filter((item) => item)
            .reduce(
              (a, b) => ({
                lockStats: {
                  totalKeysSold:
                    a.lockStats.totalKeysSold +
                    parseInt(b.lockStats.totalKeysSold),
                  totalLocksDeployed:
                    a.lockStats.totalLocksDeployed +
                    parseInt(b.lockStats.totalLocksDeployed),
                },
                unlockDailyDatas: [
                  ...a.unlockDailyDatas,
                  ...b.unlockDailyDatas,
                ],
              }),
              {
                lockStats: { totalKeysSold: 0, totalLocksDeployed: 0 },
                unlockDailyDatas: [],
              }
            )
        )
      } else {
        const { data } = await getSubgraph4GNP(
          networks[selectedNetwork].subgraph.endpointV2,
          currentDay - 1030
        )
        setSelectedNetworkSubgraphData(data)
      }
    }
    run()
  }, [selectedNetwork, filter, subgraphData])

  useEffect(() => {
    const gnpPercentageByNetworks = subgraphData.map((networkData) => {
      const sumOfGNP = parseFloat(
        utils.formatUnits(
          BigInt(
            networkData.data.unlockDailyDatas
              .filter(
                (item) =>
                  item.id >=
                    currentDay -
                      (filter === '1D'
                        ? 2
                        : filter === '7D'
                        ? 8
                        : filter === '1M'
                        ? 31
                        : filter === '1Y'
                        ? 200
                        : 10000) && item.id <= currentDay
              )
              .reduce((pv, b) => pv + parseInt(b.grossNetworkProduct), 0)
          ),
          '18'
        )
      )
      return {
        name: networkData.name,
        gnpPercentage:
          sumOfGNP /
          gnpTotalValueByNetwork.find((item) => item.name === networkData.name)
            ?.gnpSum,
      }
    })
    setGNPPByNetworks(gnpPercentageByNetworks)
  }, [filter])

  useEffect(() => {
    const run = async () => {
      const subgraphData = await Promise.all(
        Object.keys(networks).map(async (key) => {
          if (!networks[key].isTestNetwork) {
            const { data } = await getSubgraph4GNP(
              networks[key].subgraph.endpointV2,
              currentDay - 1030
            )
            return { name: networks[key].name, data }
          }
        })
      )
      setSubgraphData(subgraphData.filter((item) => item))
    }
    run()
  }, [networks])

  useEffect(() => {
    if (subgraphData !== undefined && subgraphData.length > 0) {
      const overview_contents: IOverView[] = [
        {
          value: subgraphData.reduce(
            (pv, b) => pv + parseInt(b.data.lockStats.totalLocksDeployed),
            0
          ),
          title: 'Total of Locks Deployed',
          description: 'All Time, production networks only',
          Icon: Lock,
        },
        {
          value: subgraphData.reduce(
            (pv, b) => pv + parseInt(b.data.lockStats.totalKeysSold),
            0
          ),
          title: 'Total of Keys Sold',
          description: 'All Time, production networks only',
          Icon: Key,
        },
        {
          value: CalcActiveLocksCount(subgraphData),
          title: 'Active Locks',
          description: 'Minted at least 1 membership in the last 30 days',
          Icon: ActiveLock,
        },
      ]
      const gnpDataByNetworks = subgraphData.map((networkData) => ({
        name: networkData.name,
        gnpSum: parseFloat(
          utils.formatUnits(
            BigInt(
              networkData.data.unlockDailyDatas.reduce(
                (pv, b) => pv + parseInt(b.grossNetworkProduct),
                0
              )
            ),
            '18'
          )
        ),
      }))
      setOverViewData(overview_contents)
      setGnpTotalValueByNetwork(gnpDataByNetworks)
    }
  }, [subgraphData])

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4">
          <h1 className="heading text-center space-y-8"> State of Unlock </h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">Overview</p>
              <div className="grid gap-1 md:gap-4 grid-cols-1 md:grid-cols-3">
                {overViewData &&
                  overViewData.map(
                    ({ value, title, description, Icon }, index) => (
                      <div
                        key={index}
                        className="w-full p-8 trans-pane rounded-md"
                      >
                        <h2 className="heading-small space-y-4">
                          {numeral(value).format('0,0')}
                        </h2>
                        <p className="py-2 text-lg sm:text-xl lg:text-2xl text-black max-w-prose font-bold">
                          {title}
                        </p>
                        <div className="flex justify-between">
                          <span>{description}</span>
                          <Icon className="self-center w-7 h-7 not-sr-only" />
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">Activity over time</p>
              <div className="flex justify-between flex-wrap gap-2">
                <select
                  id="network"
                  className="bg-white text-black rounded-md border-none px-4"
                  value={selectedNetwork}
                  onChange={(e) => {
                    setSelectedNetwork(e.target.value)
                  }}
                >
                  <option value="ALL" key="ALL">
                    All
                  </option>
                  {gnpValues &&
                    gnpValues
                      .filter(({ network }) => !network.isTestNetwork)
                      .map(({ network }, index) => (
                        <option
                          value={Object.keys(networks).find(
                            (key) => networks[key].name === network.name
                          )}
                          key={index}
                        >
                          {network.name}
                        </option>
                      ))}
                </select>
                <DateFilter filter={filter} setFilter={setFilter} />
              </div>
              <RenderChart series={series} xaxis={xaxis} />
            </div>
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">
                Gross Network Product
              </p>
              {!isLoading && (
                <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-4 md:grid-cols-2 grid-cols-1">
                  {gnpValues
                    .filter((item) => !item.network.isTestNetwork)
                    .map(({ total, network }, index) => (
                      <div
                        key={index}
                        className="p-6 border border-gray-300 rounded-md"
                      >
                        <div className="flex justify-start pb-4 border-b border-gray-300">
                          <CryptoIcon
                            symbol={network.baseCurrencySymbol}
                            size={40}
                          />
                          <p className="heading-small pr-2 self-center">
                            {numeral(total).format('0,0.000')}{' '}
                          </p>
                          <p className="heading-small pr-2 self-center">
                            {network.baseCurrencySymbol.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex justify-between pt-4">
                          <p className="font-bold text-xl">{network.name}</p>
                          <p className="font-bold text-xl">
                            +
                            {numeral(
                              gnpPByNetworks.filter(
                                (item) => item.name === network.name
                              )[0]?.gnpPercentage
                            ).format('0.0%')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
