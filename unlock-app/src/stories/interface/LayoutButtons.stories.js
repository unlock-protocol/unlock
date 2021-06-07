import React from 'react'
import { storiesOf } from '@storybook/react'
import LayoutButtons from '../../components/interface/buttons/layout'
import { ConfigContext } from '../../utils/withConfig'

import configure from '../../config'

const config = configure()

storiesOf('Buttons/Layout Buttons', module)
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
  .add('Discord', () => {
    return <LayoutButtons.Discord />
  })
  .add('Twitter', () => {
    return <LayoutButtons.Twitter />
  })
