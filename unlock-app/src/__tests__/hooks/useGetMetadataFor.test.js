import { renderHook } from '@testing-library/react-hooks'

import useGetMetadataFor from '../../hooks/useGetMetadataFor'

const lockAddress = '0xlock'

const walletService = {
  getKeyMetadata: jest.fn(),
}
const config = {
  services: {
    storage: {
      host: 'locksmith',
    },
  },
}
const keyId = '1'
const getProtectedData = false

const metadata = {
  userMetadata: {
    protected: {
      email: 'julien@unlock-protocol.com',
    },
    public: {
      name: 'julien',
    },
  },
}

describe('useGetMetadataFor', () => {
  it.skip('should default to yielding loading, metadata and error', () => {
    expect.assertions(3)
    const { result } = renderHook(() =>
      useGetMetadataFor(
        walletService,
        config,
        lockAddress,
        keyId,
        getProtectedData
      )
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.metadata).toEqual({ userMetadata: {} })
    expect(result.current.error).toBe(false)
  })

  describe('when getting protected data', () => {
    it.skip('should call getKeyMetadata with the right values', () => {
      expect.assertions(1)
      renderHook(() => {
        useGetMetadataFor(
          walletService,
          config,
          lockAddress,
          keyId,
          true /* getProtectedData */
        )
      })
      expect(walletService.getKeyMetadata).toHaveBeenCalledWith(
        {
          lockAddress,
          keyId,
          locksmithHost: config.services.storage.host,
          getProtectedData: true,
        },
        expect.any(Function)
      )
    })
  })

  it.skip('should call getKeyMetadata with the right values', () => {
    expect.assertions(1)
    renderHook(() => {
      useGetMetadataFor(
        walletService,
        config,
        lockAddress,
        keyId,
        false /* getProtectedData */
      )
    })
    expect(walletService.getKeyMetadata).toHaveBeenCalledWith(
      {
        lockAddress,
        keyId,
        locksmithHost: config.services.storage.host,
        getProtectedData: false,
      },
      expect.any(Function)
    )
  })

  it.skip('should set the corresponding metadata and change the loading state', () => {
    expect.assertions(4)
    walletService.getKeyMetadata = jest.fn((args, callback) => {
      callback(null, metadata)
    })
    const { result } = renderHook(() =>
      useGetMetadataFor(walletService, config, lockAddress, keyId, false)
    )
    expect(result.current.loading).toEqual(false)
    expect(result.current.error).toEqual(false)
    expect(result.current.metadata).toEqual(metadata)
  })

  it.skip('should set the corresponding error and change the loading state when there is one', () => {
    expect.assertions(4)
    walletService.getKeyMetadata = jest.fn((args, callback) => {
      callback(new Error(), metadata)
    })
    const { result } = renderHook(() =>
      useGetMetadataFor(walletService, config, lockAddress, keyId, false)
    )
    expect(result.current.loading).toEqual(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.metadata).toEqual({ userMetadata: {} })
  })
})
