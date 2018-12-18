import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Etherscan = props => (
  <LayoutButton label="Etherscan" {...props}>
    <Svg.Etherscan name="Etherscan" />
  </LayoutButton>
)

export default Etherscan
