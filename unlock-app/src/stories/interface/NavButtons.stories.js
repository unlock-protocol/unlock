import React from 'react'
import { storiesOf } from '@storybook/react'
import NavButtons from '../../components/interface/buttons/navigation'

storiesOf('Buttons/Nav Buttons', module)
  .add('Dashboard', () => {
    return <NavButtons.Dashboard activePath="/" />
  })
  .add('Dashboard, active', () => {
    return <NavButtons.Dashboard activePath="/dashboard" />
  })
