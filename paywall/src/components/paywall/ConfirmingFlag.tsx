import React from 'react'

import { RoundedLogo } from '../interface/Logo'
import Svg from '../interface/svg'
import {
  OptimisticFlag,
  OptimisticLogo,
  ProgressBar,
  Progress,
  PoweredByUnlock,
  Info,
} from './FlagStyles'
import { Transaction } from '../../unlockTypes'

interface ConfirmingProps {
  requiredConfirmations: number
  transaction?: Transaction | null
}

export default function ConfirmingFlag({
  requiredConfirmations,
  transaction = null,
}: ConfirmingProps) {
  let text = 'Powered by Unlock'
  let Confirmations = null
  if (transaction) {
    text = 'Confirming Purchase'
    Confirmations = (
      <ProgressBar>
        <Progress
          requiredConfirmations={requiredConfirmations}
          confirmations={transaction.confirmations}
        />
      </ProgressBar>
    )
  }
  return (
    <OptimisticFlag>
      <OptimisticLogo>
        <RoundedLogo />
      </OptimisticLogo>
      <p>{text}</p>
      {Confirmations}
      <Info
        href="https://github.com/unlock-protocol/unlock/wiki/Frequently-Asked-Questions#what-is-optimistic-unlocking"
        target="_blank"
      >
        <Svg.Info />
      </Info>
      <PoweredByUnlock>
        <p>Powered by</p>
        <OptimisticLogo>
          <RoundedLogo />
        </OptimisticLogo>
        <a href="/">Unlock</a>
      </PoweredByUnlock>
    </OptimisticFlag>
  )
}
