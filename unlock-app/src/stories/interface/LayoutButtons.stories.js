import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import LayoutButtons from '../../components/interface/buttons/layout'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Buttons/Layout Buttons', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Github', () => {
    return <LayoutButtons.Github />
  })
  .add('About', () => {
    return <LayoutButtons.About />
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
    return <LayoutButtons.Jobs />
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
