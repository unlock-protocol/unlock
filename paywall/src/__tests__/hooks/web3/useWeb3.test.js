import * as rtl from 'react-testing-library'
import React from 'react'

import { ReadOnlyContext } from '../../../hooks/components/Web3'
import useWeb3 from '../../../hooks/web3/useWeb3'

describe('useWeb3 hook', () => {
  const { Provider } = ReadOnlyContext

  function wrapper(props) {
    return <Provider value="web3" {...props} />
  }

  it('retrieves the read-only web3 object from context', () => {
    const {
      result: { current: web3 },
    } = rtl.testHook(() => useWeb3(), { wrapper })

    expect(web3).toBe('web3')
  })
})
