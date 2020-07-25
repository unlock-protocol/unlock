import { renderHook, act } from '@testing-library/react-hooks'
import useMarkAsCheckedIn from '../../hooks/useMarkAsCheckedIn'
import {
  waitForWallet,
  dismissWalletCheck,
} from '../../actions/fullScreenModals'

// Mocks
const walletService = {
  setKeyMetadata: jest.fn(() => {}),
}
const config = {
  services: {
    storage: {
      host: 'host',
    },
  },
}
const key = {
  keyId: '3',
  lock: {
    address: '0xlockAddress',
  },
}
const mockDispatch = jest.fn(() => {})

jest.mock('react-redux', () => {
  return {
    useSelector: jest.fn(),
    useDispatch: jest.fn(() => mockDispatch),
  }
})

describe('useMarkAsCheckedIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a triplet with the function to check people in, the checkedIn state and no error', async () => {
    expect.assertions(3)

    const { result } = renderHook(() =>
      useMarkAsCheckedIn(walletService, config, key)
    )

    expect(result.current.markAsCheckedIn).toBeInstanceOf(Function)
    expect(result.current.checkedIn).toBe(false)
    expect(result.current.error).toBe(false)
  })

  describe('useMarkAsCheckedIn', () => {
    it('should ask the user to check their wallet', async () => {
      expect.assertions(1)

      const { result } = renderHook(() =>
        useMarkAsCheckedIn(walletService, config, key)
      )

      act(() => {
        result.current.markAsCheckedIn()
      })
      expect(mockDispatch).toHaveBeenCalledWith(waitForWallet())
    })
  })

  it('should setKeyMetadata on the walletService', async () => {
    expect.assertions(5)

    const { result } = renderHook(() =>
      useMarkAsCheckedIn(walletService, config, key)
    )

    walletService.setKeyMetadata = jest.fn((params) => {
      expect(params.lockAddress).toEqual(key.lock.address)
      expect(params.keyId).toEqual(key.keyId)
      expect(params.metadata.checkedInAt).toBeGreaterThan(
        new Date().getTime() - 1000
      )
      expect(params.locksmithHost).toEqual(config.services.storage.host)
    })

    act(() => {
      result.current.markAsCheckedIn()
    })
    expect(walletService.setKeyMetadata).toHaveBeenCalled()
  })

  it('should release the overlay when the data was saved', async () => {
    expect.assertions(2)

    const { result } = renderHook(() =>
      useMarkAsCheckedIn(walletService, config, key)
    )

    walletService.setKeyMetadata = jest.fn((params, callback) => {
      callback(null, true)
    })

    act(() => {
      result.current.markAsCheckedIn()
    })
    expect(mockDispatch).toHaveBeenCalledWith(waitForWallet())
    expect(mockDispatch).toHaveBeenCalledWith(dismissWalletCheck())
  })

  it('should release the overlay when the data was saved and yield true for the checkedIn state', async () => {
    expect.assertions(4)

    const { result } = renderHook(() =>
      useMarkAsCheckedIn(walletService, config, key)
    )

    walletService.setKeyMetadata = jest.fn((params, callback) => {
      callback(null, true)
    })

    act(() => {
      result.current.markAsCheckedIn()
    })
    expect(mockDispatch).toHaveBeenCalledWith(waitForWallet())
    expect(mockDispatch).toHaveBeenCalledWith(dismissWalletCheck())
    expect(result.current.checkedIn).toBe(true)
    expect(result.current.error).toBe(false)
  })

  it('should release the overlay when the data was not saved and yield false for the checkedIn state as well as the corresponding error', async () => {
    expect.assertions(4)

    const { result } = renderHook(() =>
      useMarkAsCheckedIn(walletService, config, key)
    )

    walletService.setKeyMetadata = jest.fn((params, callback) => {
      callback(new Error(), false)
    })

    act(() => {
      result.current.markAsCheckedIn()
    })
    expect(mockDispatch).toHaveBeenCalledWith(waitForWallet())
    expect(mockDispatch).toHaveBeenCalledWith(dismissWalletCheck())
    expect(result.current.checkedIn).toBe(false)
    expect(result.current.error).toBe(
      'There was an error to check this user in.'
    )
  })
})
