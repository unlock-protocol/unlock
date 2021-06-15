import React from 'react'
import Svg from '../../svg'
import Button from '../Button'
import UnlockPropTypes from '../../../../propTypes'
import DisabledButton from '../DisabledButton'

const CreditCard = ({ lock, ...props }) => {
  if (lock?.publicLockVersion < 7) {
    return (
      <DisabledButton {...props}>
        <Svg.CreditCard name="Credit card" />
      </DisabledButton>
    )
  }
  return (
    <Button label="Credit card" {...props}>
      <Svg.CreditCard name="Credit card" />
    </Button>
  )
}

CreditCard.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default CreditCard
