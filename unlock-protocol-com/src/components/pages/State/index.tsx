import { Button } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import {
  ActiveLock,
  Lock,
  Key,
  PolygonIcon,
  DAIIcon,
  EthereumIcon,
  BSCIcon,
  CeloIcon,
} from '../../icons'
import numeral from 'numeral'
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const OVERVIEW_CONTENTS = [
  {
    value: 84019,
    title: 'Total of Locks Deployed',
    description: 'All Time, production networks only',
    Icon: Lock,
  },
  {
    value: 4293238,
    title: 'Total of Keys Sold',
    description: 'All Time, production networks only',
    Icon: Key,
  },
  {
    value: 281,
    title: 'Active Locks',
    description: 'Minted at least 1 membership in the last 30 days',
    Icon: ActiveLock,
  },
]

const NETWORKS = [
  'All Networks',
  'Ethereum',
  'Optimism',
  'Binance Smart Chain',
  'Gnosis Chain',
  'Polygon',
  'Arbitrum',
  'Celo',
  'Avalanche (C-Chain)',
]

const GROSS_NETWORK_VALUES = [
  {
    value: 169705.121,
    unit: 'MATIC',
    title: 'Polygon',
    total: '2039',
    Icon: PolygonIcon,
  },
  {
    value: 114285.134,
    unit: 'DAI',
    title: 'Gnosis Chain',
    total: '2039',
    Icon: DAIIcon,
  },
  {
    value: 502.441,
    unit: 'ETH',
    title: 'Ethereum',
    total: '1.33',
    Icon: EthereumIcon,
  },
  {
    value: 1.414,
    unit: 'oETH',
    title: 'Optimism',
    total: '0.33',
    Icon: EthereumIcon,
  },
  {
    value: 0.112,
    unit: 'aETH',
    title: 'Avalanche',
    total: '0.00',
    Icon: EthereumIcon,
  },
  {
    value: 0.102,
    unit: 'aETH',
    title: 'Arbitrum',
    total: '0.00',
    Icon: EthereumIcon,
  },
  {
    value: 0.075,
    unit: 'BNB',
    title: 'Binance Smart Chain',
    total: '0.00',
    Icon: BSCIcon,
  },
  {
    value: 0.021,
    unit: 'CELO',
    title: 'Celo',
    total: '0.00',
    Icon: CeloIcon,
  },
]

const filters = ['1D', '7D', '1M', '1Y', 'All']

function RenderChart() {
  const chartOptions = {
    series: [
      {
        name: 'Session Duration',
        data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
      },
      {
        name: 'Page Views',
        data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
      },
      {
        name: 'Total Visits',
        data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
      },
    ],
    options: {
      chart: { zoom: { enabled: false } },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        hover: {
          sizeOffset: 6,
        },
      },
      xaxis: {
        categories: [
          '01 Jan',
          '02 Jan',
          '03 Jan',
          '04 Jan',
          '05 Jan',
          '06 Jan',
          '07 Jan',
          '08 Jan',
          '09 Jan',
          '10 Jan',
          '11 Jan',
          '12 Jan',
        ],
      },
      yaxis: { show: false },
      tooltip: {
        y: [
          {
            title: {
              formatter: function (val) {
                return val + ' (mins)'
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val + ' per session'
              },
            },
          },
          {
            title: {
              formatter: function (val) {
                return val
              },
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
        series={chartOptions.series}
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

export function State() {
  const [filter, setFilter] = useState('1Y')
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4">
          <h1 className="heading text-center space-y-8"> State of Unlock </h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">Overview</p>
              <div className="grid gap-4 grid-cols-3">
                {OVERVIEW_CONTENTS.map(
                  ({ value, title, description, Icon }, index) => (
                    <div
                      key={index}
                      className="w-full p-8 trans-pane rounded-md"
                    >
                      <h2 className="heading-small space-y-4">
                        {numeral(value).format('0,0')}
                      </h2>
                      <div className="flex justify-between">
                        <div>
                          <p className="pt-2 text-lg sm:text-xl lg:text-2xl text-black max-w-prose font-bold">
                            {title}
                          </p>
                          <span>{description}</span>
                        </div>
                        <Icon className="self-center not-sr-only" />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">Activity over time</p>
              <div className="flex justify-between">
                <select
                  id="network"
                  className="bg-white text-black rounded-md border-none px-4"
                >
                  {NETWORKS.map((item, index) => (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  ))}
                </select>
                <DateFilter filter={filter} setFilter={setFilter} />
              </div>
              <RenderChart />
            </div>
            <div className="space-y-2">
              <p className="text-2xl space-y-1 font-bold">
                Gross Network Product
              </p>
              <div className="grid lg:grid-cols-3 gap-4 md:grid-cols-2 grid-cols-1">
                {GROSS_NETWORK_VALUES.map(
                  ({ value, unit, title, total, Icon }, index) => (
                    <div
                      key={index}
                      className="p-6 border border-gray-300 rounded-md"
                    >
                      <div className="flex justify-start pb-4 border-b border-gray-300">
                        <Icon className="self-center mr-2 w-10 h-auto" />
                        <p className="heading-small pr-2">
                          {numeral(value).format('0,0.000')}{' '}
                        </p>
                        <p className="heading-small pr-2">{unit}</p>
                      </div>
                      <div className="flex justify-between pt-4">
                        <p className="font-bold text-xl">{title}</p>
                        <p className="font-bold text-xl">
                          +{numeral(total).format('0,0.0')}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
