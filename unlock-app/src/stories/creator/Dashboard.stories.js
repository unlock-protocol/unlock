import React from 'react'
import { storiesOf } from '@storybook/react'
import Dashboard from '../../components/creator/Dashboard'

storiesOf('Dashboard')
  .add('the dashboard', () => {
    const account = {
      address: '0x3ca206264762caf81a8f0a843bbb850987b41e16',
    }
    const network = {
      name: 4,
    }
    return (
      <Dashboard network={network} account={account} />
    )
  })
