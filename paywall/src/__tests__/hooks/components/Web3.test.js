import * as rtl from 'react-testing-library'
import React from 'react'
import MockWeb3 from 'web3'

import Web3, { ReadOnlyContext } from '../../../hooks/components/Web3'
import { ConfigContext } from '../../../hooks/utils/useConfig'

jest.mock('web3')

describe('Web3 component', () => {
  const { Provider } = ConfigContext
  const { Consumer } = ReadOnlyContext

  let config
  beforeEach(() => {
    config = {
      readOnlyProvider: false,
      providers: [],
    }
    MockWeb3.mockClear()
  })

  it('uses readOnlyProvider if set', () => {
    expect.assertions(1)
    config.readOnlyProvider = 'read-only'

    rtl.render(
      <Provider value={config}>
        <Web3>
          <div>hi</div>
        </Web3>
      </Provider>
    )

    expect(MockWeb3).toHaveBeenCalledWith('read-only')
  })

  it('uses the first provider if read-only provider is not set', () => {
    expect.assertions(1)
    config.providers = ['first', 'second']

    rtl.render(
      <Provider value={config}>
        <Web3>
          <div>hi</div>
        </Web3>
      </Provider>
    )

    expect(MockWeb3).toHaveBeenCalledWith('first')
  })

  it('gets the web3 passed down from above', () => {
    expect.assertions(1)

    config.providers = ['first', 'second']

    function get(web3) {
      expect(web3).toEqual(expect.objectContaining({}))
    }

    rtl.render(
      <Provider value={config}>
        <Web3>
          <Consumer>{get}</Consumer>
        </Web3>
      </Provider>
    )
  })
})
