import * as mutations from '../../paywall-builder/mutationobserver'
import * as buildManager from '../../paywall-builder/build'
import { initializePaywall } from '../../paywall-builder/index'

describe('paywall builder integration', () => {
  let listenForNewLocks
  let buildPaywall
  beforeEach(() => {
    listenForNewLocks = jest
      .spyOn(mutations, 'listenForNewLocks')
      .mockImplementation(() => 'listen')
    buildPaywall = jest
      .spyOn(buildManager, 'default')
      .mockImplementation(() => 'paywall')
  })

  afterEach(() => jest.restoreAllMocks())

  it('calls listenForLocks', () => {
    global.window = {}

    require('../../paywall-builder')
    window.onload()

    expect(listenForNewLocks.mock.calls[0][1]).toBe(document.head)

    const paywall = listenForNewLocks.mock.calls[0][0]
    expect(paywall).toBeInstanceOf(Function)
    paywall('lock')

    expect(buildPaywall).toHaveBeenCalledWith(window, document, 'lock')
  })
})
