/* eslint-disable import/no-extraneous-dependencies */

import '@testing-library/jest-dom/extend-expect'
import 'jest-styled-components'

import { setConfig } from 'next/config'
import config from './next.config'

// Make sure you can use getConfig
setConfig({
  publicRuntimeConfig: config.publicRuntimeConfig,
})

// Mocking fetch calls
require('jest-fetch-mock').enableMocks()
