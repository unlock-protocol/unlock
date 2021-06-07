import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const CreditCard = (props) => (
  <Button label="Credit card" {...props}>
    <Svg.CreditCard name="Credit card" />
  </Button>
)

export default CreditCard
