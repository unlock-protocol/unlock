/* eslint-disable import/no-extraneous-dependencies */

import '@testing-library/jest-dom/extend-expect'
import 'jest-styled-components'
import 'mutationobserver-shim'

import { setConfig } from 'next/config'
import config from './next.config'

require('jest-fetch-mock').enableMocks()

// Make sure you can use getConfig
setConfig({
  publicRuntimeConfig: config.publicRuntimeConfig,
})
