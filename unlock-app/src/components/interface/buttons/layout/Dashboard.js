import React from 'react'
import Svg from '../../svg'
import LayoutButton from '../LayoutButton'

const Dashboard = props => (
  <LayoutButton href="/dashboard" label="Dashboard" {...props}>
    <Svg.Home title="Dashboard" />
  </LayoutButton>
)

export default Dashboard
