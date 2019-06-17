import start from '../../../data-iframe/start'
import postOffice from '../../../data-iframe/postOffice'
import { addListener } from '../../../data-iframe/cacheHandler'
import setupPostOfficeListener from '../../../data-iframe/postOfficeListener'
import makeSetConfig from '../../../data-iframe/start/makeSetConfig'
import { purchaseKey } from '../../../data-iframe/start/purchaseKeySetup'
import { POST_MESSAGE_INITIATED_TRANSACTION } from '../../../paywall-builder/constants'

jest.mock('../../../data-iframe/postOffice')
jest.mock('../../../data-iframe/cacheHandler')
jest.mock('../../../data-iframe/postOfficeListener')
jest.mock('../../../data-iframe/start/makeSetConfig')

describe('data iframe startup index', () => {
  let blockChainUpdater
  let addHandler
  let setConfig
  const constants = {
    readOnlyProvider: 'hi',
    unlockAddress: 'address',
    blockTime: 8000,
    requiredConfirmations: 2,
    locksmitHost: 'locksmith',
  }

  beforeEach(() => {
    setConfig = jest.fn()
    blockChainUpdater = jest.fn()
    addHandler = jest.fn()
    postOffice.mockReset()
    postOffice.mockImplementationOnce(() => ({
      blockChainUpdater,
      addHandler,
    }))
    makeSetConfig.mockReset()
    makeSetConfig.mockImplementationOnce(() => setConfig)
  })

  it('should set up the post office', async () => {
    expect.assertions(1)

    await start(window, constants)

    expect(postOffice).toHaveBeenCalledWith(
      window,
      constants.requiredConfirmations
    )
  })

  it('should add a listener to the cache with the post office updater', async () => {
    expect.assertions(1)

    await start(window, constants)

    expect(addListener).toHaveBeenCalledWith(blockChainUpdater)
  })

  it('should setup the post office listener', async () => {
    expect.assertions(1)

    await start(window, constants)

    expect(setupPostOfficeListener).toHaveBeenCalledWith(
      window,
      blockChainUpdater,
      setConfig,
      purchaseKey,
      addHandler
    )
  })

  it('should call makeSetConfig with the expected parameters', async () => {
    expect.assertions(1)

    await start(window, constants)

    expect(makeSetConfig).toHaveBeenCalledWith(
      window,
      blockChainUpdater,
      constants,
      expect.any(Function)
    )
  })

  it('should pass a callback that initiates the POST_MESSAGE_INITIATED_TRANSACTION handler', async () => {
    expect.assertions(1)

    const fakeRetrieveChainData = jest.fn()
    await start(window, constants)

    makeSetConfig.mock.calls[0][3](fakeRetrieveChainData)

    expect(addHandler).toHaveBeenCalledWith(
      POST_MESSAGE_INITIATED_TRANSACTION,
      expect.any(Function)
    )
  })

  it('should handle POST_MESSAGE_INITIATED_TRANSACTION by retrieving chain data', async () => {
    expect.assertions(1)

    const fakeRetrieveChainData = jest.fn()
    await start(window, constants)

    makeSetConfig.mock.calls[0][3](fakeRetrieveChainData)
    // simulate how it will be called
    // the "action" will be:
    // { type: POST_MESSAGE_INITIATED_TRANSACTION, payload: undefined }
    // and the post office passes the payload in
    addHandler.mock.calls[0][1](undefined)

    expect(fakeRetrieveChainData).toHaveBeenCalled()
  })

  it('should send "ready" to the updater to start the entire process', async () => {
    expect.assertions(1)

    await start(window, constants)

    expect(blockChainUpdater).toHaveBeenCalledWith('ready')
  })
})
