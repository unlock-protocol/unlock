import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Footer from '../../components/interface/Footer'
import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const store = createUnlockStore({})
const config = configure()

storiesOf('Footer', module)
  .addDecorator((getStory) => <Provider store={store}>{getStory()}</Provider>)
  .add('the footer', () => {
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Footer />
      </ConfigProvider>
    )
  })
