import React, { useEffect, useState } from 'react'
import { IconBaseProps } from 'react-icons'
import { ActiveLock, Lock, Key } from '../../../icons'
import numeral from 'numeral'

type IOverView = {
  Icon: (props: IconBaseProps) => JSX.Element
  value: number
  title: string
  description: string
}

export function Overview({ lockStats }) {
  const [overViewData, setOverViewData] = useState<IOverView[]>([])

  useEffect(() => {
    if (lockStats !== undefined && lockStats.length > 0) {
      const overview_contents: IOverView[] = [
        {
          value: lockStats.reduce((pv, b) => pv + b?.totalLocksDeployed, 0),
          title: 'Total of Locks Deployed',
          description: 'All Time, production networks only',
          Icon: Lock,
        },
        {
          value: lockStats.reduce((pv, b) => pv + b?.totalKeysSold, 0),
          title: 'Total of Keys Sold',
          description: 'All Time, production networks only',
          Icon: Key,
        },
        {
          value: lockStats.reduce((pv, b) => pv + b?.activeLocks, 0),
          title: 'Active Locks',
          description: 'Minted at least 1 membership in the last 30 days',
          Icon: ActiveLock,
        },
      ]
      setOverViewData(overview_contents)
    }
  }, [lockStats])

  return (
    <div className="grid grid-cols-1 gap-1 md:gap-4 md:grid-cols-3">
      {overViewData &&
        overViewData.map(({ value, title, description, Icon }, index) => (
          <div key={index} className="w-full p-8 rounded-md trans-pane">
            <h2 className="space-y-4 heading-small">
              {numeral(value).format('0,0')}
            </h2>
            <p className="py-2 text-lg font-bold text-black sm:text-xl lg:text-2xl max-w-prose">
              {title}
            </p>
            <div className="flex justify-between">
              <span>{description}</span>
              <Icon className="self-center not-sr-only w-7 h-7" />
            </div>
          </div>
        ))}
    </div>
  )
}
