import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Twitter = props => (
  <LayoutButton href="/twitter" title="Twitter" {...props}>
    <Svg.Twitter name="Twitter" />
  </LayoutButton>
)

export default Twitter
