import * as mutations from '../../paywall-builder/mutationObserver'
import * as buildManager from '../../paywall-builder/build'
import * as blockerManager from '../../paywall-builder/blocker'

describe('paywall builder integration', () => {
  let listenForNewLocks
  let buildPaywall
  let getBlocker
  let addBlocker
  beforeEach(() => {
    listenForNewLocks = jest
      .spyOn(mutations, 'listenForNewLocks')
      .mockImplementation(() => 'listen')
    buildPaywall = jest
      .spyOn(buildManager, 'default')
      .mockImplementation(() => 'paywall')
    getBlocker = jest
      .spyOn(blockerManager, 'getBlocker')
      .mockImplementation(() => 'blocker')
    addBlocker = jest
      .spyOn(blockerManager, 'addBlocker')
      .mockImplementation(() => 'addblocker')
  })

  afterEach(() => jest.restoreAllMocks())

  it('calls listenForLocks', () => {
    expect.assertions(5)
    global.window = {}

    require('../../paywall-builder')
    window.onload()

    expect(listenForNewLocks.mock.calls[0][1]).toBe(document.head)

    const paywall = listenForNewLocks.mock.calls[0][0]
    expect(paywall).toBeInstanceOf(Function)
    paywall('lock')

    expect(buildPaywall).toHaveBeenCalledWith(
      window,
      document,
      'lock',
      'blocker'
    )
    expect(getBlocker).toHaveBeenCalled()
    expect(addBlocker).toHaveBeenCalledWith(document, 'blocker')
  })
})
