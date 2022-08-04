import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Wallet = (props) => (
  <Button
    label="Wallet"
    {...props}
    backgroundColor="var(--blue)"
    fillColor="var(--white)"
    showLabel
    size="36px"
  >
    <Svg.Wallet name="Wallet" />
  </Button>
)

export default Wallet
