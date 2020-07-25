import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Jobs = (props) => (
  <LayoutButton href="/jobs" label="Join us" {...props}>
    <Svg.Jobs name="Jobs" />
  </LayoutButton>
)

export default Jobs
