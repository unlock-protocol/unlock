import React from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { storiesOf } from '@storybook/react'
import Layout from '../../components/interface/Layout'

storiesOf('Layout', module)
  .add('the layout with menu', () => {
    return <Layout title="Paywall" showIcons />
  })
  .add('the layout without menu', () => {
    return <Layout title="Paywall" />
  })
