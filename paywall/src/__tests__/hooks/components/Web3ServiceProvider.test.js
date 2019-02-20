import * as rtl from 'react-testing-library'
import React from 'react'

import Web3ServiceProvider, {
  Web3ServiceContext,
} from '../../../hooks/components/Web3ServiceProvider'
import { ConfigContext } from '../../../hooks/utils/useConfig'
import configure from '../../../config'

// This unlock address smart contract is fake
const unlockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'

describe('Web3Service component', () => {
  const { Consumer } = Web3ServiceContext
  const config = { ...configure(), unlockAddress }

  it('passes the web3Service down to consumers', () => {
    expect.assertions(1)

    function get(web3) {
      expect(web3).toEqual(
        expect.objectContaining({ web3: expect.any(Object) })
      )
    }

    rtl.render(
      <ConfigContext.Provider value={config}>
        <Web3ServiceProvider>
          <Consumer>{get}</Consumer>
        </Web3ServiceProvider>
      </ConfigContext.Provider>
    )
  })
})
