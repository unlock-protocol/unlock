import React from 'react'
import * as rtl from 'react-testing-library'

import useOptimism from '../../hooks/useOptimism'
import useLocksmith from '../../hooks/useLocksmith'

jest.mock('../../hooks/useLocksmith')
jest.useFakeTimers()

describe('useOptimism hook', () => {
  function MockOptimism() {
    const result = useOptimism('0x123')

    return <div>{JSON.stringify(result)}</div>
  }

  beforeEach(() => {
    useLocksmith.mockImplementation(() => ({
      willSucceed: 1,
    }))
  })

  it('calls useLocksmith properly', () => {
    expect.assertions(1)

    rtl.render(<MockOptimism />)

    expect(useLocksmith).toHaveBeenCalledWith('/transaction/0x123/odds', {
      willSucceed: 0,
    })
  })

  it('returns the result of useLocksmith', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<MockOptimism />)

    expect(
      wrapper.getByText(JSON.stringify({ current: 1, past: 0 }))
    ).not.toBeNull()
  })

  it('freaks out after 15 seconds', () => {
    expect.assertions(1)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<MockOptimism />)
      jest.runAllTimers()
    })

    expect(
      wrapper.getByText(JSON.stringify({ current: 0, past: 1 }))
    ).not.toBeNull()
  })
})
