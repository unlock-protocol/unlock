import React from 'react'
import Svg from '../../svg'
import { LayoutButton } from '../Button'

const Jobs = props => (
  <LayoutButton href="/jobs" title="Join us" {...props}>
    <Svg.Jobs name="Jobs" />
  </LayoutButton>
)

export default Jobs
