import React, { useRef, useEffect } from 'react'
import * as Plot from '@observablehq/plot'

export function HistoricalChart({
  dailyStats,
  filter,
  supportedNetworks,
  viewFilter,
}) {
  const ref = useRef<HTMLInputElement>()
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
              tip: 'x',
              cumulative: viewFilter.cumulative,
            }
          )
        ),
      ],
    })

    ref.current?.append(barChart)
    return () => barChart.remove()
  }, [dailyStats, viewFilter, filter.period, supportedNetworks])

  return (
    <div style={{ margin: '0 auto' }}>
      <div ref={ref}></div>
    </div>
  )
}
