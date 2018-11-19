import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Etherscan = props => (
  <LockButton {...props}>
    <Svg.Etherscan name="Etherscan" />
  </LockButton>
)

export default Etherscan
