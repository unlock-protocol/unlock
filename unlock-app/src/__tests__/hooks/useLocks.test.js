import { renderHook } from '@testing-library/react-hooks'
import useLocks from '../../hooks/useLocks'
import { UNLIMITED_KEYS_COUNT } from '../../constants'

const mockWeb3Service = {
  getLock: jest.fn(() => Promise.resolve({})),
}
const mockGraphService = {
  locksByOwner: jest.fn(() => Promise.resolve(graphLocks)),
}

jest.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service() {
      return mockWeb3Service
    },
  }
})

jest.mock('../../services/graphService', () => {
  return () => {
    return mockGraphService
  }
})

const ownerAddress = '0xlockOwner'

let graphLocks = []

describe('useLocks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should default to loading and an empty list', async () => {
    expect.assertions(4)
    const { result, waitForNextUpdate } = renderHook(() =>
      useLocks(ownerAddress)
    )
    const [loading, locks] = result.current
    expect(loading).toBe(true)
    expect(locks.length).toBe(0)
    await waitForNextUpdate()
    const [loadingAfter, locksAfter] = result.current
    expect(loadingAfter).toBe(false)
    expect(locksAfter.length).toBe(0)
  })

  it('retrieve the list of locks from the graph', async () => {
    expect.assertions(3)
    graphLocks = [
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]

    const { result, waitForNextUpdate } = renderHook(() =>
      useLocks(ownerAddress)
    )
    await waitForNextUpdate()
    const [loading, locks] = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(2)
    expect(mockGraphService.locksByOwner).toHaveBeenCalledWith(ownerAddress)
  })

  it('retrieve the locks details', async () => {
    expect.assertions(4)
    graphLocks = [
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]
    const web3ServiceLock = {
      name: 'My Lock',
    }
    mockWeb3Service.getLock = jest.fn(() => {
      return Promise.resolve(web3ServiceLock)
    })

    const { result, waitForNextUpdate } = renderHook(() =>
      useLocks(ownerAddress)
    )
    await waitForNextUpdate()
    const [loading, locks] = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(2)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(graphLocks[0].address)
    expect(mockWeb3Service.getLock).toHaveBeenCalledWith(graphLocks[1].address)
  })

  it('retrieve the locks details and set unlimitedKeys when applicable', async () => {
    expect.assertions(3)
    graphLocks = [
      {
        address: '0x123',
      },
    ]
    const web3ServiceLock = {
      name: 'My Lock',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
    }
    mockWeb3Service.getLock = jest.fn(() => {
      return Promise.resolve(web3ServiceLock)
    })

    const { result, waitForNextUpdate } = renderHook(() =>
      useLocks(ownerAddress)
    )
    await waitForNextUpdate()
    const [loading, locks] = result.current
    expect(loading).toBe(false)
    expect(locks.length).toBe(1)
    expect(locks[0]).toEqual({
      ...web3ServiceLock,
      address: graphLocks[0].address,
      unlimitedKeys: true,
    })
  })
})
