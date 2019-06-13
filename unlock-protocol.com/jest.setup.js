/* eslint-disable import/no-extraneous-dependencies */

import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import 'jest-styled-components'

import { setConfig } from 'next/config'
import config from './next.config'

// Make sure you can use getConfig
setConfig({
  publicRuntimeConfig: config.publicRuntimeConfig,
  intercomAppId: '0',
  googleAnalyticsId: '0',
})
