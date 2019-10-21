import { renderHook } from '@testing-library/react-hooks'
import { ethers } from 'ethers'
import useEns from '../../hooks/useEns'

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
    const { result, waitForNextUpdate } = renderHook(() =>
      useEns({ address: '0xabc' })
    )

    expect(result.current).toBe('0xabc')
    await waitForNextUpdate()
    expect(result.current).toBe('julien.unlock-protocol.eth')
  })
})
