import React from 'react'
import Svg from '../../svg'
import PageNavButton from '../PageNavButton'

const Log = props => (
  <PageNavButton href="/log" label="Log" {...props}>
    <Svg.Log title="Log" />
  </PageNavButton>
)

export default Log
