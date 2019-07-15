import web3ServiceHub from '../../../data-iframe/blockchainHandler/web3ServiceHub'
import { setAccount } from '../../../data-iframe/cacheHandler'
import { TRANSACTION_TYPES } from '../../../constants'

describe('web3ServiceHub', () => {
  let fakeWindow

  function makeFakeWindow() {
    fakeWindow = {
      storage: {},
      localStorage: {
        getItem: jest.fn(key => fakeWindow.storage[key]),
        setItem: jest.fn((key, value) => {
          if (typeof value !== 'string') {
            throw new Error('localStorage only supports strings')
          }
          fakeWindow.storage[key] = value
        }),
        removeItem: jest.fn(key => {
          delete fakeWindow.storage[key]
        }),
      },
    }
  }

  beforeEach(() => {
    makeFakeWindow()
  })

  it("should set up a listener for 'transaction.updated'", async () => {
    expect.assertions(1)

    const onChange = () => {}
    const web3Service = {
      on: jest.fn(),
    }

    await web3ServiceHub({
      web3Service,
      onChange,
      window: fakeWindow,
    })

    expect(web3Service.on).toHaveBeenNthCalledWith(
      1,
      'transaction.updated',
      expect.any(Function)
    )
  })

  it("should set up a listener for 'error'", async () => {
    expect.assertions(1)

    const onChange = () => {}
    const web3Service = {
      on: jest.fn(),
    }

    await web3ServiceHub({
      web3Service,
      onChange,
      window: fakeWindow,
    })

    expect(web3Service.on).toHaveBeenNthCalledWith(
      2,
      'error',
      expect.any(Function)
    )
  })

  describe('transaction.updated listener', () => {
    let onChange
    let web3Service

    function getTransactionListener() {
      return web3Service.on.mock.calls[0][1]
    }
    beforeEach(async () => {
      makeFakeWindow()
      onChange = jest.fn()
      web3Service = {
        on: jest.fn(),
        getKeyByLockForOwner: (lock, owner) => ({
          expiration: 123,
          lock,
          owner,
        }),
      }
      await setAccount(fakeWindow, 'account')
    })

    it('should use the cached transaction as a base', async () => {
      expect.assertions(2)

      await web3ServiceHub({
        web3Service,
        onChange,
        window: fakeWindow,
      })

      const listener = getTransactionListener()

      await await listener('hi', {
        hash: 'hi',
        thing: 'value',
      })

      await listener('hi', { another: 'thing' })

      expect(onChange).toHaveBeenNthCalledWith(1, {
        transaction: {
          hash: 'hi',
          thing: 'value',
          blockNumber: Number.MAX_SAFE_INTEGER,
        },
      })

      expect(onChange).toHaveBeenNthCalledWith(2, {
        transaction: {
          hash: 'hi',
          thing: 'value',
          another: 'thing',
          blockNumber: Number.MAX_SAFE_INTEGER,
        },
      })
    })

    it('should use an empty transaction as a base if it is not cached', async () => {
      expect.assertions(1)

      await web3ServiceHub({
        web3Service,
        onChange,
        window: fakeWindow,
      })

      const listener = getTransactionListener()

      await listener('hi', { another: 'thing' })

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: {
            hash: 'hi',
            another: 'thing',
            blockNumber: Number.MAX_SAFE_INTEGER,
          },
        })
      )
    })

    it('should not call onChange for non-key purchase transactions', async () => {
      expect.assertions(1)

      await web3ServiceHub({
        web3Service,
        onChange,
        window: fakeWindow,
      })

      const listener = getTransactionListener()

      await listener('hi', {
        another: 'thing',
        type: TRANSACTION_TYPES.LOCK_CREATION,
      })

      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should call onChange with the new key for key purchases', async () => {
      expect.assertions(2)

      await web3ServiceHub({
        web3Service,
        onChange,
        window: fakeWindow,
      })

      const listener = getTransactionListener()

      await listener('hi', {
        another: 'thing',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        lock: 'lock',
        key: 'lock-account',
      })

      expect(onChange).toHaveBeenCalledTimes(2)
      expect(onChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          key: {
            expiration: 123,
            lock: 'lock',
            owner: 'account', // this verifies we pulled it from the cache
          },
        })
      )
    })
  })

  describe('error listener', () => {
    let onChange
    let web3Service

    function getErrorListener() {
      return web3Service.on.mock.calls[1][1]
    }
    beforeEach(async () => {
      makeFakeWindow()
      onChange = jest.fn()
      web3Service = {
        on: jest.fn(),
      }
      await setAccount(fakeWindow, 'account')
    })

    it('should call onChange with the error', async () => {
      expect.assertions(1)

      await web3ServiceHub({
        web3Service,
        onChange,
        window: fakeWindow,
      })

      const listener = getErrorListener()

      await listener('error')

      expect(onChange).toHaveBeenCalledWith({ error: 'error' })
    })
  })
})
