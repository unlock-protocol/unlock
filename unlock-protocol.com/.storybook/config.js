import React from 'react'
import { configure, addDecorator, addParameters } from '@storybook/react'
import 'storybook-chromatic'
import GlobalStyle from '../src/theme/globalStyle'
import Fonts from '../src/theme/fonts'

import { setConfig } from 'next/config'

setConfig({
  publicRuntimeConfig: {
    unlockEnv: 'test',
    intercomAppId: '0',
    googleAnalyticsId: '0',
  },
})

const req = require.context('../src/stories', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

const GlobalStyleDecorator = storyFn => (
  <React.Fragment>
    <Fonts />
    <GlobalStyle />
    {storyFn()}
  </React.Fragment>
)

addParameters({
  chromatic: { viewports: [320, 1200] },
})
addDecorator(GlobalStyleDecorator)
configure(loadStories, module)
