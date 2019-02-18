import * as rtl from 'react-testing-library'
import React from 'react'

import { Web3ServiceContext } from '../../../hooks/components/Web3Service'
import useWeb3Service from '../../../hooks/web3/useWeb3Service'

describe('useWeb3Service hook', () => {
  const { Provider } = Web3ServiceContext

  function wrapper(props) {
    return <Provider value="web3" {...props} />
  }

  it('retrieves the web3Service object from context', () => {
    const {
      result: { current: web3 },
    } = rtl.testHook(() => useWeb3Service(), { wrapper })

    expect(web3).toBe('web3')
  })
})
