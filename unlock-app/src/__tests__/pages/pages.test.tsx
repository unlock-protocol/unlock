import * as rtl from '@testing-library/react'

import Home from '../../../app/page'

import { pageTitle } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'
import configure from '../../config'
import { vi, expect } from 'vitest'

const config = configure()

vi.mock('../../constants')

const ConfigProvider = ConfigContext.Provider

describe('Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Home', () => {
    it.skip('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Home />
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalled()
    })
  })
})
