import React, { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'

interface IViewFilter {
  label: string
  value: string
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
    value: 'totalLockDeployed',
  },
  {
    label: 'Keys (cumulative)',
    value: 'totalKeysSold',
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
    <div className="flex flex-row items-center justify-center gap-4 p-2 rounded-md">
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

export function HistoricalChart({ dailyStats, filter }) {
  const ref = useRef()
  const [viewFilter, setViewFilter] = useState<IViewFilter>(views[1])

  useEffect(() => {
    const barChart = Plot.plot({
      width: 1200,
      height: 500,
      marginLeft: 50,
      marginTop: 50,
      marginBottom: 50,
      y: {
        grid: true,
        axis: 'left',
        label: `${viewFilter.label}`,
      },
      color: {
        type: 'categorical',
        scheme: 'Tableau10',
        legend: true,
        // width: 628,
        label: 'Networks',
      },
      marks: [
        // locks deployed
        Plot.rectY(
          dailyStats,
          Plot.binX(
            {
              y: 'sum',
            },
            {
              x: 'date',
              y: viewFilter.value,
              fill: 'name',
              interval: filter.period <= 365 ? 'day' : 'week',
            }
          )
        ),
      ],
    })

    ref.current?.append(barChart)
    return () => barChart.remove()
  }, [dailyStats, viewFilter])

  return (
    <div>
      <ViewFilter viewFilter={viewFilter} setViewFilter={setViewFilter} />
      <div ref={ref}></div>
    </div>
  )
}
