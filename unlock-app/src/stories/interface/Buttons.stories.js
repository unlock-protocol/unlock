import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import Buttons from '../../components/interface/buttons/lock'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Buttons/Lock Buttons', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Withdraw, no balance', () => {
    const lock = {
      address: '0xabc',
    }
    return <Buttons.Withdraw lock={lock} />
  })
  .add('Withdraw, positive balance', () => {
    const lock = {
      address: '0xabc',
      balance: 1,
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
    return <Buttons.Preview lock={lock} />
  })
  .add('Upload', () => {
    return <Buttons.Upload />
  })
