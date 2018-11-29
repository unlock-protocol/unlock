import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import LayoutButtons from '../../components/interface/buttons/layout'
import Buttons from '../../components/interface/buttons/lock'
import OverlayButtons from '../../components/interface/buttons/overlay'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Buttons')
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Github', () => {
    return <LayoutButtons.Github />
  })
  .add('About', () => {
    return <LayoutButtons.About />
  })
  .add('Jobs', () => {
    return <LayoutButtons.Jobs />
  })
  .add('Close', () => {
    return <LayoutButtons.Close as="button" />
  })
  .add('Close Large', () => {
    return <LayoutButtons.Close as="button" size="100px" />
  })
  .add('Close Small', () => {
    return <LayoutButtons.Close as="button" size="16px" />
  })
  .add('Withdraw', () => {
    const lock = {
      address: '0xabc',
    }
    return <Buttons.Withdraw lock={lock} />
  })
  .add('Preview', () => {
    const lock = {
      address: '0xabc',
    }
    return <Buttons.Preview lock={lock} />
  })
  .add('Confirmed Key', () => {
    return <OverlayButtons.ConfirmedKey />
  })
