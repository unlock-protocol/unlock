import React from 'react'

import { Key } from '../../unlockTypes'
import Svg from '../interface/svg'
import useConfig from '../../hooks/utils/useConfig'
import {
  ProgressBar,
  Progress,
  OptimisticFlag,
  OptimisticLogo,
  Info,
  PoweredByUnlock,
} from './FlagStyles'
import { WordMarkLogo } from '../interface/Logo'

interface Props {
  unlockKey: Key
}

export default function CheckoutFlag({ unlockKey }: Props) {
  const { requiredConfirmations } = useConfig()
  return (
    <OptimisticFlag>
      <p>Confirming Purchase</p>
      <ProgressBar>
        <Progress
          requiredConfirmations={requiredConfirmations}
          confirmations={unlockKey.confirmations}
        />
      </ProgressBar>
      <Info
        href="https://github.com/unlock-protocol/unlock/wiki/Frequently-Asked-Questions#what-is-optimistic-unlocking"
        target="_blank"
      >
        <Svg.Info />
      </Info>
      <PoweredByUnlock>
        <p>Powered by</p>
        <a href="/">
          <OptimisticLogo>
            <WordMarkLogo alt="Unlock" />
          </OptimisticLogo>
        </a>
      </PoweredByUnlock>
    </OptimisticFlag>
  )
}
