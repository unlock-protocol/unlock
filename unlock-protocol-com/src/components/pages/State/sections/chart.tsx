import React, { useRef, useEffect, useState } from 'react'
import * as Plot from '@observablehq/plot'

export function HistoricalChart({
  dailyStats,
  filter,
  supportedNetworks,
  viewFilter,
}) {
  const ref = useRef()

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
        legend: false,
        domain: supportedNetworks.map(({ name }) => name),
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
      <div ref={ref}></div>
    </div>
  )
}
