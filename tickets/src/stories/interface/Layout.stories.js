import React from 'react'
import { storiesOf } from '@storybook/react'
import Layout from '../../components/interface/Layout'

storiesOf('Layout', module)
  .add('the layout with menu', () => {
    return <Layout title="Paywall" showIcons />
  })
  .add('the layout without menu', () => {
    return <Layout title="Paywall" />
  })
