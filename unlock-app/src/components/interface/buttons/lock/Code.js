import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Code = props => (
  <Button title="Show embed code" {...props}>
    <Svg.Code name="Code" />
  </Button>
)

export default Code
