import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const ChevronUp = props => (
  <LayoutButton {...props}>
    <Svg.ChevronUp title="Chevron Up" />
  </LayoutButton>
)

export default ChevronUp
