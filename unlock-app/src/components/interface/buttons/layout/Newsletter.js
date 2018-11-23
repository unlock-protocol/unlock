import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Newsletter = props => (
  <LayoutButton href="/newsletter" title="Newsletter" {...props}>
    <Svg.Newsletter name="Newsletter" />
  </LayoutButton>
)

export default Newsletter
