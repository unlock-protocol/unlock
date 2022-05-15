/* eslint-disable import/no-extraneous-dependencies */

import '@testing-library/jest-dom/extend-expect'
import 'jest-styled-components'


jest.doMock('next/config', () => {
  const mockConfig = require('./next.config')
  return jest.fn(() => ({
    publicRuntimeConfig: mockConfig.publicRuntimeConfig
  })
})

// Mocking fetch calls
require('jest-fetch-mock').enableMocks()
