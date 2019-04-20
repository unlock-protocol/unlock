import React from 'react'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
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

export default function ConfirmingFlag({
  requiredConfirmations,
  transaction = null,
}) {
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

ConfirmingFlag.propTypes = {
  requiredConfirmations: PropTypes.number.isRequired,
  transaction: UnlockPropTypes.transaction,
}

ConfirmingFlag.defaultProps = {
  transaction: null,
}
