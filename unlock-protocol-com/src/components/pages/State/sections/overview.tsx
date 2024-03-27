import React, { useEffect, useState } from 'react'
import { IconBaseProps } from 'react-icons'
import { ActiveLock, Lock, Key } from '../../../icons'
import numeral from 'numeral'
import { utils } from 'ethers'

type IOverView = {
  Icon: (props: IconBaseProps) => JSX.Element
  value: number
  title: string
  description: string
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

export function Overview({ subgraphData }) {
  const [overViewData, setOverViewData] = useState<IOverView[]>([])

  useEffect(() => {
    if (subgraphData !== undefined && subgraphData.length > 0) {
      const overview_contents: IOverView[] = [
        {
          value: subgraphData.reduce(
            (pv, b) => pv + parseInt(b?.data?.lockStats?.totalLocksDeployed),
            0
          ),
          title: 'Total of Locks Deployed',
          description: 'All Time, production networks only',
          Icon: Lock,
        },
        {
          value: subgraphData.reduce(
            (pv, b) => pv + parseInt(b?.data?.lockStats?.totalKeysSold),
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
    }
  }, [subgraphData])

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
