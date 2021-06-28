/* eslint-disable import/no-extraneous-dependencies */

import '@testing-library/jest-dom/extend-expect'
import 'jest-styled-components'

import { setConfig } from 'next/config'
import mockConfig from './next.config'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: mockConfig.publicRuntimeConfig,
}))

// Mocking fetch calls
require('jest-fetch-mock').enableMocks()
