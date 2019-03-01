import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Log = props => (
  <LayoutButton href="/log" label="Log" {...props}>
    <Svg.Log title="Log" />
  </LayoutButton>
)

export default Log
