import React from 'react'
import Svg from '../../svg'
import Button from '../Button'

const Demo = (props) => (
  <Button label="Demo" {...props}>
    <Svg.LiveDemo name="Demo" />
  </Button>
)

export default Demo
