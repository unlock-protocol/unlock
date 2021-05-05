import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import useEns from '../../hooks/useEns'
import { ConfigContext } from '../../utils/withConfig'
import { AuthenticationContext } from '../../components/interface/Authenticate'

jest.mock('ethers')

describe('useEns', () => {
  beforeAll(() => {
    ethers.providers.JsonRpcProvider = jest.fn(() => {
      return {
        lookupAddress: () => {
          return 'julien.unlock-protocol.eth'
        },
      }
    })
  })

  it('should yield the name if there one', async () => {
    expect.assertions(2)
    const wrapper = ({ children }) => (
      <AuthenticationContext.Provider value={{ network: 1 }}>
        <ConfigContext.Provider
          value={{
            networks: {
              1: {
                provider: 'http://provider',
              },
            },
          }}
        >
          {children}
        </ConfigContext.Provider>
      </AuthenticationContext.Provider>
    )
    const { result, waitForNextUpdate } = renderHook(
      () => useEns({ address: '0xabc' }),
      { wrapper }
    )

    expect(result.current.address).toBe('0xabc')
    await waitForNextUpdate()
    expect(result.current).toBe('julien.unlock-protocol.eth')
  })
})
