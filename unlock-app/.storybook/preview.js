import React from 'react'
import GlobalStyle from '../src/theme/globalStyle'
import Fonts from '../src/theme/fonts'

import { setConfig } from 'next/config'

setConfig({
  publicRuntimeConfig: {
    unlockEnv: 'dev',
  },
})


export const decorators = [
  (Story) => (
  <React.Fragment>
    <Fonts />
    <GlobalStyle />
    <Story />
  </React.Fragment>
  ),
];