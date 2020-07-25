import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Etherscan = (props) => (
  <Button label="Etherscan" {...props}>
    <Svg.Etherscan name="Etherscan" />
  </Button>
)

export default Etherscan
