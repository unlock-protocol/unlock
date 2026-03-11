import React, { ReactNode } from 'react'
import { useStats } from 'src/hooks/useStats'
import numeral from 'numeral'

interface StatProps {
  value: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  description: ReactNode
}

function Stat({ value, title, description }: StatProps) {
  return (
    <div className="grid gap-4 p-8 border border-gray-400 rounded-lg border-1">
      <span className="text-4xl font-bold text-gray-800">{value}</span>
      <div className="grid gap-1">
        <span className="text-lg font-bold text-gray-800">{title}</span>
        <span className="text-sm text-gray-800">{description}</span>
      </div>
    </div>
  )
}

export default function UnlockStats() {
  const { totalLocksDeployed, totalKeysSold, isLoading } = useStats()

  const STATS: StatProps[] = [
    {
      value: isLoading ? '...' : numeral(totalLocksDeployed).format('0,0'),
      title: 'Membership Smart Contracts (Locks) Deployed',
      description: 'All time, production networks only',
    },
    {
      value: isLoading ? '...' : numeral(totalKeysSold).format('0,0'),
      title: 'Membership NFTs (Keys) Minted',
      description: 'All time, production networks only',
    },
    {
      value: '282%',
      title: 'Growth in Number of Deployed Smart Contracts',
      description: 'Year-over-year, production networks only',
    },
  ]

  return (
    <div className="flex flex-col gap-14">
      <span className="text-2xl font-bold text-black md:text-4xl">
        Unlock Protocol is{' '}
        <span className="text-brand-ui-primary">fully audited</span> and happily
        used by over <span className="text-brand-ui-primary">5,000</span>{' '}
        developers and community members
      </span>
      <div className="grid gap-6 md:grid-cols-3">
        {STATS.map((stat: StatProps, index: number) => (
          <Stat key={index} {...stat} />
        ))}
      </div>
    </div>
  )
}
