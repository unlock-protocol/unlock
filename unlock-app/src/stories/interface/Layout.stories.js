import React from 'react'
import { storiesOf } from '@storybook/react'
import Layout from '../../components/interface/Layout'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const config = configure()

storiesOf('Layout', module)
  .add('the layout for the dashboard', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Layout title="Unlock Dashboard" />
      </ConfigProvider>
    )
  })
  .add('the layout for the content page', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Layout forContent title="About Unlock" />
      </ConfigProvider>
    )
  })
