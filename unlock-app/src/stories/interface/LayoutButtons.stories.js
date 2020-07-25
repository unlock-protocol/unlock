import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import LayoutButtons from '../../components/interface/buttons/layout'
import { ConfigContext } from '../../utils/withConfig'

import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'

const store = createUnlockStore({})

const config = configure()

storiesOf('Buttons/Layout Buttons', module)
  .addDecorator((getStory) => <Provider store={store}>{getStory()}</Provider>)
  .add('Github', () => {
    return <LayoutButtons.Github />
  })
  .add('About', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <LayoutButtons.About />
      </ConfigProvider>
    )
  })
  .add('Bars', () => {
    return <LayoutButtons.Bars />
  })
  .add('ChevronUp', () => {
    return <LayoutButtons.ChevronUp />
  })
  .add('Close Large', () => {
    return <LayoutButtons.Close as="button" size="100px" />
  })
  .add('Close Small', () => {
    return <LayoutButtons.Close as="button" size="16px" />
  })
  .add('Jobs', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <LayoutButtons.Jobs />
      </ConfigProvider>
    )
  })
  .add('Newsletter', () => {
    return <LayoutButtons.Newsletter />
  })
  .add('Telegram', () => {
    return <LayoutButtons.Telegram />
  })
  .add('Twitter', () => {
    return <LayoutButtons.Twitter />
  })
