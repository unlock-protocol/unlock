import React from 'react'
import { useConfig } from '~/utils/withConfig'
import { WarningBar } from './BalanceWarning'

interface NetworkWarningProps {
  additionalText?: string
  date: Date
}

const NETWORK_MAPPING_MAPPING: Record<number, NetworkWarningProps> = {
  5: {
    date: new Date('30 Apr 2024'),
  },
  80001: {
    date: new Date('30 Apr 2024'),
  },
}

export const NetworkWarning = ({
  network,
}: {
  network: number | undefined
}) => {
  const config = useConfig()
  if (!network) return null
  if (!NETWORK_MAPPING_MAPPING[network!]) return
  const { date } = NETWORK_MAPPING_MAPPING[network!]
  const networkName = config.networks[network!].name

  return (
    <WarningBar>
      <span>
        {networkName} is getting deprecated on{' '}
        {date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        .
      </span>
    </WarningBar>
  )
}
