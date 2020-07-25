import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { Header } from '../../components/interface/Header'

import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const store = createUnlockStore({})
const config = configure()

storiesOf('Header', module)
  .addDecorator((getStory) => <Provider store={store}>{getStory()}</Provider>)
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
