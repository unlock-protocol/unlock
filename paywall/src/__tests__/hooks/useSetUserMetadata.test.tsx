import { renderHook, act } from '@testing-library/react-hooks'
import { EventEmitter } from 'events'
import { useSetUserMetadata, Status } from '../../hooks/useSetUserMetadata'

class MockWalletService extends EventEmitter {
  setUserMetadata: any

  constructor() {
    super()
    this.setUserMetadata = jest.fn()
  }

  connect() {}
}
let mockWalletService = new MockWalletService()

jest.mock('@unlock-protocol/unlock-js', () => {
  const mockUnlock = require.requireActual('@unlock-protocol/unlock-js') // Original module
  return {
    ...mockUnlock,
    WalletService() {
      return mockWalletService
    },
  }
})

jest.mock('../../hooks/utils/useConfig', () => () => ({
  unlockAddress: '0xunlockaddress',
  locksmithUri: 'https://locksmith',
}))

const lockAddress = '0xlockaddress'
const userAddress = '0xuseraddress'

describe('useSetUserMetadata', () => {
  it('returns NOT_SENT status initially', () => {
    expect.assertions(1)

    const { result } = renderHook(() =>
      useSetUserMetadata(lockAddress, userAddress, undefined)
    )

    expect(result.current.status).toBe(Status.NOT_SENT)
  })

  it('returns IN_PROGRESS when a request is in progress', () => {
    expect.assertions(1)

    let metadata: any

    const { result, rerender } = renderHook(() =>
      useSetUserMetadata(lockAddress, userAddress, metadata)
    )

    metadata = {
      publicData: {
        name: 'Steve',
      },
    }
    rerender()

    expect(result.current.status).toBe(Status.IN_PROGRESS)
  })

  it('returns FAILED if the request fails', () => {
    expect.assertions(1)

    let metadata: any

    const { result, rerender } = renderHook(() =>
      useSetUserMetadata(lockAddress, userAddress, metadata)
    )
    mockWalletService.setUserMetadata = jest.fn((_, callback) => {
      act(() => callback(new Error('fail')))
    })

    metadata = {
      publicData: {
        name: 'Steve',
      },
    }
    rerender()

    expect(result.current.status).toBe(Status.FAILED)
  })

  it('returns SUCCEEDED if the request succeeds', () => {
    expect.assertions(1)

    let metadata: any

    const { result, rerender } = renderHook(() =>
      useSetUserMetadata(lockAddress, userAddress, metadata)
    )
    mockWalletService.setUserMetadata = jest.fn((_, callback) => {
      act(() => callback(undefined))
    })

    metadata = {
      publicData: {
        name: 'Steve',
      },
    }
    rerender()

    expect(result.current.status).toBe(Status.SUCCEEDED)
  })
})
