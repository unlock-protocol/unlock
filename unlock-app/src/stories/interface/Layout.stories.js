import React from 'react'
import { storiesOf } from '@storybook/react'
import Layout from '../../components/interface/Layout'

storiesOf('Layout', module)
  .add('the layout for the dashboard', () => {
    return <Layout title="Unlock Dashboard" />
  })
  .add('the layout for the content page', () => {
    return <Layout forContent title="About Unlock" />
  })
