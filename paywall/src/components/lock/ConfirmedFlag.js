import React from 'react'
import PropTypes from 'prop-types'

import { RoundedLogo } from '../interface/Logo'
import ConfirmedKey from '../interface/buttons/overlay/ConfirmedKey'
import { OptimisticFlag, OptimisticLogo, FlagContent } from './LockStyles'

export default function ConfirmedFlag({ dismiss }) {
  return (
    <OptimisticFlag>
      <OptimisticLogo>
        <RoundedLogo size="28px" />
      </OptimisticLogo>
      <FlagContent>
        <p>Purchase Confirmed</p>
        <ConfirmedKey height="24px" width="24px" hideModal={dismiss} />
      </FlagContent>
    </OptimisticFlag>
  )
}

ConfirmedFlag.propTypes = {
  dismiss: PropTypes.func.isRequired,
}
