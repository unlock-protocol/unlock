import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useLock } from '../../../../hooks/useLock'

import Svg from '../../svg'
import Button from '../Button'
import DisabledButton from '../DisabledButton'
import UnlockPropTypes from '../../../../propTypes'
import { AuthenticationContext } from '../../../../contexts/AuthenticationContext'

export const Withdraw = ({ withdraw, lock, ...props }) => {
  const { network } = useContext(AuthenticationContext)

  if (lock.balance > 0) {
    return (
      <Button label="Withdraw" action={withdraw} {...props}>
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
  withdraw: PropTypes.func.isRequired,
}

export default Withdraw
