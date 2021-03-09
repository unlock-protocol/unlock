import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useLock } from '../../../../hooks/useLock'

import Svg from '../../svg'
import Button from '../Button'
import DisabledButton from '../DisabledButton'
import UnlockPropTypes from '../../../../propTypes'

export const Withdraw = ({ lock, ...props }) => {
  const { withdraw } = useLock(lock)

  if (lock.balance > 0) {
    return (
      <Button
        label="Withdraw"
        action={() => {
          if (lock.balance > 0) {
            withdraw()
          }
        }}
        {...props}
      >
        <Svg.Withdraw name="Withdraw" />
      </Button>
    )
  }
  return (
    <DisabledButton {...props}>
      <Svg.Withdraw name="Withdraw" />
    </DisabledButton>
  )
}

Withdraw.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default Withdraw
