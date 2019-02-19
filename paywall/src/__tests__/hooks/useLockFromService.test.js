import React from 'react'
import * as rtl from 'react-testing-library'

import { Web3ServiceContext } from '../../hooks/components/Web3Service'
import useLockFromService from '../../hooks/useLockFromService'

describe('useLockFromService hook', () => {
  let web3
  let addEventListener
  let removeEventListener

  function MockLockFromService() {
    const lock = useLockFromService('0x123')
    return <div title="lock">{JSON.stringify(lock)}</div>
  }
  function Wrapper() {
    return (
      <Web3ServiceContext.Provider value={web3}>
        <MockLockFromService />
      </Web3ServiceContext.Provider>
    )
  }

  beforeEach(() => {
    addEventListener = jest.fn()
    removeEventListener = jest.fn()
    web3 = {
      addEventListener,
      removeEventListener,
    }
  })

  it('listens for lock updates', () => {
    rtl.render(<Wrapper />)

    expect(addEventListener).toHaveBeenCalledWith(
      'lock.updated',
      expect.any(Function)
    )
  })

  it('stops listening for lock updates on unmount', () => {
    const { unmount } = rtl.render(<Wrapper />)

    unmount()
    expect(removeEventListener).toHaveBeenCalledWith(
      'lock.updated',
      expect.any(Function)
    )
  })

  it('sets lock on update', () => {
    const wrapper = rtl.render(<Wrapper />)

    const update = addEventListener.mock.calls[0][1]

    rtl.act(() => {
      update('account', { address: 'hi', stuff: 'thing' })
    })

    expect(wrapper.getByTitle('lock')).toHaveTextContent(
      JSON.stringify({ address: 'hi', stuff: 'thing' })
    )
  })
})
