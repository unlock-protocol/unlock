import Svg from '../../svg'
import React from 'react'
import { LockButton } from '../Button'

const Etherscan = (props) => (
  <LockButton {...props}>
    <Svg.Etherscan />
  </LockButton>
)

export default Etherscan
