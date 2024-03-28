import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

type ISeries = {
  name: string
  data: number[]
}
type IXaxis = {
  categories: string[]
}

function parseRenderData(subgraphData, timestampArray: number[]) {
  console.log(timestampArray)
  console.log(subgraphData)
  return timestampArray.map((dayId) => {
    const dayDatas = unlockDailyDatas.filter(
      (item) => item.id >= dayId - 1 && item.id < dayId
    )

    const keys = dayDatas.reduce((x, y) => x + Number(y.totalKeysSold), 0)

    const lastMonthActiveLocks = unlockDailyDatas.unlockDailyDatas
      .filter((item) => item.id > dayId - 30 && item.id <= dayId)
      .map((item) => item.activeLocks)
      .flatMap((lock) => lock)
    const activeLocks = [...new Set(lastMonthActiveLocks)].length

    const allLocks = dayDatas.reduce(
      (x, y) => x + Number(y.totalLockDeployed),
      0
    )
    return {
      keys,
      activeLocks,
      allLocks,
    }
  })
}

function RenderChart({ series, xaxis }: { series: any; xaxis?: any }) {
  if (!series || series.length === 0) {
    return null
  }

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
      xaxis,
      yaxis: [
        {
          opposite: false,
          title: {
            text: 'Keys',
          },
          min: Math.max(
            0,
            Math.min(...series[0].data) -
              0.1 *
                (Math.max(...series[0].data) - Math.min(...series[0].data)) -
              1
          ),
          labels: {
            formatter: function (val, index) {
              return val.toFixed(0)
            },
          },
        },
        {
          show: false,
        },
        {
          opposite: true,
          title: {
            text: 'Locks',
          },
          min: Math.max(
            0,
            Math.min(...series[2].data) -
              0.1 *
                (Math.max(...series[2].data) - Math.min(...series[2].data)) -
              1
          ),
          labels: {
            formatter: function (val, index) {
              return val.toFixed(0)
            },
          },
        },
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
    <div className="w-full h-96">
      <ReactApexChart
        options={chartOptions.options}
        series={series}
        type="line"
        height={320}
      />
    </div>
  )
}

function getTimestamps({ period }) {
  const ticksCount = { '7D': 7, '1M': 12, '1Y': 30, ALL: 12 }[period]

  return [...Array(ticksCount).keys()].reverse().map((key) => {
    const cur = new Date()
    return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
    // .toLocaleString(
    //         'default',
    //         { dateStyle: 'short' }
    //       )
  })
}

export function HistoricalChart({ subgraphData, filter }) {
  const [series, setSeries] = useState<ISeries[]>([])
  const [xaxis, setXaxis] = useState<IXaxis | undefined>(undefined)

  console.log({ subgraphData })

  useEffect(() => {
    let xAxisLabels
    // let timestampArray
    // switch (filter) {
    //   case '7D': {
    //     xAxisLabels = [...Array(7).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
    //         'default',
    //         { dateStyle: 'short' }
    //       )
    //     })
    //     timestampArray = [...Array(7).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
    //     })
    //     break
    //   }
    //   case '1M': {
    //     xAxisLabels = [...Array(30).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return new Date(cur.setDate(cur.getDate() - key)).toLocaleString(
    //         'default',
    //         { dateStyle: 'short' }
    //       )
    //     })
    //     timestampArray = [...Array(30).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return Math.round(cur.setDate(cur.getDate() - key) / 86400000)
    //     })
    //     break
    //   }
    //   case '1Y': {
    //     xAxisLabels = [...Array(12).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return new Date(cur.setMonth(cur.getMonth() - key)).toLocaleString(
    //         'default',
    //         { dateStyle: 'short' }
    //       )
    //     })
    //     timestampArray = [...Array(12).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return Math.round(cur.setMonth(cur.getMonth() - key) / 86400000)
    //     })
    //     break
    //   }
    //   case 'All': {
    //     xAxisLabels = [...Array(36).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return new Date(cur.setMonth(cur.getMonth() - key)).toLocaleString(
    //         'default',
    //         { dateStyle: 'short' }
    //       )
    //     })
    //     timestampArray = [...Array(36).keys()].reverse().map((key) => {
    //       const cur = new Date()
    //       return Math.round(cur.setMonth(cur.getMonth() - key) / 86400000)
    //     })
    //     break
    //   }
    // }

    // setXaxis({
    //   categories: xAxisLabels,
    // })
    const timestamps = getTimestamps(filter)
    console.log(subgraphData)
    // const renderData = parseRenderData(subgraphData, timestamps)
    //   setSeries([
    //     {
    //       name: 'Keys (Memberships) Minted',
    //       data: renderData.map(({ keys }) => keys),
    //     },
    //     {
    //       name: 'Active Locks',
    //       data: renderData.map(({ activeLocks }) => activeLocks),
    //     },
    //     {
    //       name: 'Locks Deployed',
    //       data: renderData.map(({ allLocks }) => allLocks),
    //     },
    //   ])
  }, [subgraphData, filter])

  return <RenderChart series={series} xaxis={xaxis} />
}
