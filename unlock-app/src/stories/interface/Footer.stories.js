import React from 'react'
import { storiesOf } from '@storybook/react'
import Footer from '../../components/interface/Footer'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const config = configure()

storiesOf('Footer', module).add('the footer', () => {
  const ConfigProvider = ConfigContext.Provider
  return (
    <ConfigProvider value={config}>
      <Footer />
    </ConfigProvider>
  )
})
