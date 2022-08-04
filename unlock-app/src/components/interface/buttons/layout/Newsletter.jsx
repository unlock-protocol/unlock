import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Newsletter = (props) => (
  <LayoutButton href="/newsletter" label="Newsletter" {...props}>
    <Svg.Newsletter name="Newsletter" />
  </LayoutButton>
)

export default Newsletter
