import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Explorer = (props) => (
  <Button label="Explorer" {...props}>
    <Svg.Etherscan name="Explorer" />
  </Button>
)

export default Explorer
