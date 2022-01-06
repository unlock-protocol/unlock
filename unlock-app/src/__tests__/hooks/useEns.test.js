import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import useEns from '../../hooks/useEns'
import { ConfigContext } from '../../utils/withConfig'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

jest.mock('ethers')

describe('useEns', () => {
  beforeAll(() => {
    ethers.providers.JsonRpcProvider = jest.fn(() => {
      return {
        lookupAddress: () => {
          return 'julien51.eth'
        },
      }
    })
  })

  it('should yield the name if there is one', async () => {
    expect.assertions(2)
    const wrapper = ({ children }) => (
      <AuthenticationContext.Provider value={{ network: 1 }}>
        <ConfigContext.Provider
          value={{
            networks: {
              1: {
                publicProvider: 'http://provider',
              },
            },
          }}
        >
          {children}
        </ConfigContext.Provider>
      </AuthenticationContext.Provider>
    )
    const { result, waitForNextUpdate } = renderHook(
      () => useEns('0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'),
      { wrapper }
    )

    expect(result.current.address).toBe(
      '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
    )
    await waitForNextUpdate()
    expect(result.current).toBe('julien.unlock-protocol.eth')
  })
})
