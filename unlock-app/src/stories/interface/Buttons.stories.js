import React from 'react'
import { storiesOf } from '@storybook/react'
import Buttons from '../../components/interface/buttons/lock'

import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'

const config = configure()
storiesOf('Buttons/Lock Buttons', module)
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
