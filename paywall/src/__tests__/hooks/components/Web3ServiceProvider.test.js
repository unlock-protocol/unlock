import * as rtl from 'react-testing-library'
import React from 'react'
import MockWeb3 from 'web3'

import Web3Service, {
  Web3ServiceContext,
} from '../../../hooks/components/Web3ServiceProvider'

describe('Web3Service component', () => {
  const { Consumer } = Web3ServiceContext

  beforeEach(() => {
    MockWeb3.mockClear()
  })

  it('passes the web3Service down to consumers', () => {
    expect.assertions(1)

    function get(web3) {
      expect(web3).toEqual(
        expect.objectContaining({ web3: expect.any(Object) })
      )
    }

    rtl.render(
      <Web3Service>
        <Consumer>{get}</Consumer>
      </Web3Service>
    )
  })
})
