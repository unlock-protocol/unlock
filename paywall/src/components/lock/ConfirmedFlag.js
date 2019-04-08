import React from 'react'
import PropTypes from 'prop-types'

import { RoundedLogo } from '../interface/Logo'
import ConfirmedKey from '../interface/buttons/overlay/ConfirmedKey'
import {
  OptimisticFlag,
  OptimisticLogo,
  PoweredByUnlock,
  ConfirmedKeyWrapper,
} from './FlagStyles'

export default function ConfirmedFlag({ dismiss }) {
  return (
    <OptimisticFlag>
      <OptimisticLogo>
        <RoundedLogo size="28px" />
      </OptimisticLogo>
      <p>Purchase Confirmed</p>
      <ConfirmedKeyWrapper>
        <ConfirmedKey height="24px" width="24px" hideModal={dismiss} />
      </ConfirmedKeyWrapper>
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

ConfirmedFlag.propTypes = {
  dismiss: PropTypes.func.isRequired,
}
