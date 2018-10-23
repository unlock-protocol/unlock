import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Withdraw = (props) => (
  <LockButton {...props}>
    <Svg.Withdraw />
  </LockButton>
)

export default Withdraw
