import React from 'react'
import { storiesOf } from '@storybook/react'
import Header from '../../components/interface/Header'

import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const config = configure()

storiesOf('Header', module)
  .add('the header without a title', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Header />
      </ConfigProvider>
    )
  })
  .add('the header with a title', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Header title="Roses are red" />
      </ConfigProvider>
    )
  })
  .add('the header for a content page', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Header forContent title="Roses are red" />
      </ConfigProvider>
    )
  })
