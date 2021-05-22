import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Svg from '../../svg'
import Button from '../Button'
import UnlockPropTypes from '../../../../propTypes'

const CreditCard = ({ lock, ...props }) => {
  // Here, load status from locksmith and show accordingly!
  const [creditCardEnabled, setCreditCardEnabled] = useState(false)
  useEffect(() => {
    // Go load pricing info
  }, [lock.address])
  return (
    <Button label="Credit Card" {...props}>
      <Svg.Code name="CreditCard" />
    </Button>
  )
}
CreditCard.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default CreditCard
