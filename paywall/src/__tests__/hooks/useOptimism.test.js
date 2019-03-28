import React from 'react'
import * as rtl from 'react-testing-library'

import useOptimism from '../../hooks/useOptimism'
import useLocksmith from '../../hooks/useLocksmith'

jest.mock('../../hooks/useLocksmith')

describe('useOptimism hook', () => {
  function MockOptimismn() {
    const result = useOptimism('0x123')

    return <div>{JSON.stringify(result)}</div>
  }

  beforeEach(() => {
    useLocksmith.mockImplementation(() => ({
      willSucceed: 0,
    }))
  })

  it('calls useLocksmith properly', () => {
    expect.assertions(1)

    rtl.render(<MockOptimismn />)

    expect(useLocksmith).toHaveBeenCalledWith('/transaction/0x123/odds', {
      willSucceed: 1,
    })
  })

  it('returns the result of useLocksmith', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<MockOptimismn />)

    expect(wrapper.getByText('0')).not.toBeNull()
  })
})
