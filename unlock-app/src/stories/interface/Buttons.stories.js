import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Buttons from '../../components/interface/buttons/lock'

import createUnlockStore from '../../createUnlockStore'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const config = configure()

const store = createUnlockStore({})

storiesOf('Buttons/Lock Buttons', module)
  .addDecorator((getStory) => <Provider store={store}>{getStory()}</Provider>)
  .add('Withdraw, no balance', () => {
    const lock = {
      address: '0xabc',
    }
    return <Buttons.Withdraw lock={lock} />
  })
  .add('Withdraw, positive balance', () => {
    const lock = {
      address: '0xabc',
      balance: '1',
    }
    return <Buttons.Withdraw lock={lock} />
  })
  .add('Show Embed Code', () => {
    return <Buttons.Code />
  })
  .add('Copy', () => {
    return <Buttons.Copy />
  })
  .add('Download', () => {
    return <Buttons.Download />
  })
  .add('Edit', () => {
    return <Buttons.Edit />
  })
  .add('Etherscan', () => {
    return <Buttons.Etherscan />
  })
  .add('Export', () => {
    return <Buttons.ExportLock />
  })
  .add('Preview', () => {
    const lock = {
      address: '0xabc',
    }
    const ConfigProvider = ConfigContext.Provider
    return (
      <ConfigProvider value={config}>
        <Buttons.Preview lock={lock} />
      </ConfigProvider>
    )
  })
  .add('Upload', () => {
    return <Buttons.Upload />
  })
