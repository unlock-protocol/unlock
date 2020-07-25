import React from 'react'
import Svg from '../../svg'
import PageNavButton from '../PageNavButton'

const Settings = (props) => (
  <PageNavButton href="/settings" label="User Account Settings" {...props}>
    <Svg.Edit title="User Account Settings" />
  </PageNavButton>
)

export default Settings
