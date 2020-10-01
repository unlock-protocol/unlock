import React from 'react'
import Svg from '../../svg'
import PageNavButton from '../PageNavButton'

const Dashboard = (props) => (
  <PageNavButton href="/dashboard" label="Dashboard" {...props}>
    <Svg.Home title="Dashboard" />
  </PageNavButton>
)

export default Dashboard
