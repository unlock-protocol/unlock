import React from 'react'
import * as rtl from 'react-testing-library'

import configuration from '../../../config'
import useConfig, { ConfigContext } from '../../../hooks/utils/useConfig'

describe('useConfig hook', () => {
  const { Provider } = ConfigContext

  function wrapper(props) {
    return <Provider value={config} {...props} />
  }

  let config

  beforeEach(() => {
    config = configuration()
  })
  it('uses the ConfigContext to get its config', () => {
    expect.assertions(1)
    config = {
      hi: 'there',
      hooks: 'rock',
    }
    const {
      result: { current },
    } = rtl.testHook(() => useConfig(), { wrapper })

    expect(current).toBe(config)
  })
})
