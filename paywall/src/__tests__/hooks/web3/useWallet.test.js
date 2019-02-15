import * as rtl from 'react-testing-library'
import React from 'react'

import { WalletContext } from '../../../hooks/components/Wallet'
import useWallet from '../../../hooks/web3/useWallet'

describe('useWeb3 hook', () => {
  const { Provider } = WalletContext

  function wrapper(props) {
    return <Provider value="wallet" {...props} />
  }

  it('retrieves the wallet object from context', () => {
    const {
      result: { current: web3 },
    } = rtl.testHook(() => useWallet(), { wrapper })

    expect(web3).toBe('wallet')
  })
})
