import start from '../../../data-iframe/start'
import postOffice from '../../../data-iframe/postOffice'
import { addListener } from '../../../data-iframe/cacheHandler'
import setupPostOfficeListener from '../../../data-iframe/postOfficeListener'
import makeSetConfig from '../../../data-iframe/start/makeSetConfig'
import { purchaseKey } from '../../../data-iframe/start/purchaseKeySetup'

jest.mock('../../../data-iframe/postOffice')
jest.mock('../../../data-iframe/cacheHandler')
jest.mock('../../../data-iframe/postOfficeListener')
jest.mock('../../../data-iframe/start/makeSetConfig')

describe('data iframe startup index', () => {
  const constants = {
    readOnlyProvider: 'hi',
    unlockAddress: 'address',
    blockTime: 8000,
    requiredConfirmations: 2,
    locksmitHost: 'locksmith',
  }

  beforeEach(() => {
    postOffice.mockReset()
  })

  it('should set up the post office', async () => {
    expect.assertions(1)

    const updater = jest.fn()
    const setConfig = jest.fn()
    postOffice.mockImplementationOnce(() => updater)
    makeSetConfig.mockImplementationOnce(() => setConfig)

    await start(window, constants)

    expect(postOffice).toHaveBeenCalledWith(
      window,
      constants.requiredConfirmations
    )
  })

  it('should add a listener to the cache with the post office updater', async () => {
    expect.assertions(1)

    const updater = jest.fn()
    postOffice.mockImplementationOnce(() => updater)
    await start(window, constants)

    expect(addListener).toHaveBeenCalledWith(updater)
  })

  it('should setup the post office listener', async () => {
    expect.assertions(1)

    const updater = jest.fn()
    const setConfig = jest.fn()
    postOffice.mockImplementationOnce(() => updater)
    makeSetConfig.mockImplementationOnce(() => setConfig)

    await start(window, constants)

    expect(setupPostOfficeListener).toHaveBeenCalledWith(
      window,
      updater,
      setConfig,
      purchaseKey
    )
  })

  it('should send "ready" to the updater to start the entire process', async () => {
    expect.assertions(1)

    const updater = jest.fn()
    const setConfig = jest.fn()
    postOffice.mockImplementationOnce(() => updater)
    makeSetConfig.mockImplementationOnce(() => setConfig)

    await start(window, constants)

    expect(updater).toHaveBeenCalledWith('ready')
  })
})
