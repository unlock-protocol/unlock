import makeSetConfig from '../../../data-iframe/start/makeSetConfig'
import connectToBlockchain from '../../../data-iframe/start/connectToBlockchain'
import { getLocks } from '../../../data-iframe/cacheHandler'

jest.mock('../../../data-iframe/start/connectToBlockchain', () =>
  jest.genMockFromModule('../../../data-iframe/start/connectToBlockchain')
)

describe('makeSetConfig', () => {
  const window = 'window'
  const keys = {
    key: { lock: 'address' },
  }
  const transactions = {
    hash: { hash: 'hash' },
  }
  const fakeRetrieveData = () => ({
    keys,
    transactions,
  })

  const constants = {
    hi: 'there',
    thing: 2,
  }
  let updater

  it('should return a callback function which is used to receive paywall config', () => {
    expect.assertions(1)

    const setConfig = makeSetConfig(window, updater, constants, () => {})

    expect(setConfig).toBeInstanceOf(Function)
  })

  describe('setConfig callback', () => {
    let setConfig
    let fakeWindow
    let fakeAddTransactionHandler

    beforeEach(() => {
      fakeAddTransactionHandler = jest.fn()
      fakeWindow = {
        storage: {},
        localStorage: {
          clear: () => (fakeWindow.storage = {}),
          setItem(key, item) {
            fakeWindow.storage[key] = item
          },
          getItem(key) {
            return fakeWindow.storage[key]
          },
          removeItem(key) {
            delete fakeWindow.storage[key]
          },
        },
      }
      updater = jest.fn()
      setConfig = makeSetConfig(
        fakeWindow,
        updater,
        constants,
        fakeAddTransactionHandler
      )
      connectToBlockchain.mockImplementationOnce(() => fakeRetrieveData)
    })

    it('should immediately trigger sends of cached blockchain data', async () => {
      expect.assertions(4)

      const config = {}
      await setConfig(config)

      expect(updater).toHaveBeenNthCalledWith(1, 'network')
      expect(updater).toHaveBeenNthCalledWith(2, 'account')
      expect(updater).toHaveBeenNthCalledWith(3, 'balance')
      expect(updater).toHaveBeenNthCalledWith(4, 'locks')
    })

    it('should connect to the blockchain', async () => {
      expect.assertions(1)

      const config = {}
      await setConfig(config)

      expect(connectToBlockchain).toHaveBeenCalledWith(
        expect.objectContaining({
          ...constants,
          config,
          window: fakeWindow,
          onChange: expect.any(Function),
        })
      )
    })

    it('should pass a function to retrieve chain data to the transaction listener', async () => {
      expect.assertions(1)

      const config = {}
      await setConfig(config)

      expect(fakeAddTransactionHandler).toHaveBeenCalledWith(fakeRetrieveData)
    })

    describe('onChange callback behavior', () => {
      let onChange
      let setConfig
      let fakeWindow

      beforeEach(async () => {
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
        connectToBlockchain.mockReset()
        connectToBlockchain.mockImplementationOnce(() => ({
          keys,
          transactions,
        }))

        updater = jest.fn()
        setConfig = makeSetConfig(fakeWindow, updater, constants)

        const config = {}
        await setConfig(config)

        onChange = connectToBlockchain.mock.calls[0][0].onChange
        updater.mockReset()
      })

      it('should pass errors directly to the updater', () => {
        expect.assertions(1)

        onChange({ error: 'fail' })

        expect(updater).toHaveBeenCalledWith('error', 'fail')
      })

      it('should pass walletModal notifications directly to the updater', () => {
        expect.assertions(1)

        onChange({ walletModal: true })

        expect(updater).toHaveBeenCalledWith('walletModal')
      })

      it('should sync the other values to cache', async () => {
        expect.assertions(1)

        const update = {
          locks: {
            lock: { address: 'lock' },
          },
        }

        await onChange(update)

        expect(await getLocks(fakeWindow)).toEqual(update.locks)
      })
    })
  })
})
