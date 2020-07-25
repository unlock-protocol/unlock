import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Close = (props) => (
  <LayoutButton {...props}>
    <Svg.Close title="Close" />
  </LayoutButton>
)

export default Close
