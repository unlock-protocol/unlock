import pollForChanges from '../../../data-iframe/blockchainHandler/pollForChanges'

// note: the "await Promise.resolve()" calls cause our test to "attach" to the await calls in the function.
// without them, the function will run after the test has completed.
describe('pollForChanges', () => {
  async function runToInitValue() {
    await Promise.resolve() // flushes the "await getFunc" line
  }
  // run the pollForChanges up to the next iteration
  async function runToFirstDelay() {
    await runToInitValue() // flushes the "await getFunc" line
    jest.runOnlyPendingTimers() // flushes the delayPromise setTimeout
    await Promise.resolve() // flushes the delayPromise promise
  }

  // this should be run after "runToInitValue" and then can be run repeatedly
  async function runIteration() {
    await Promise.resolve() // flushes the "await getFunc" line
    await Promise.resolve() // flushes the "await hasValueChanged" line
    await Promise.resolve() // flushes the delayPromise promise
    jest.runOnlyPendingTimers() // flushes the delayPromise setTimeout
    await Promise.resolve() // flushes the delayPromise promise
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
    jest.useFakeTimers()
  })

  it('calls getFunc on start', () => {
    expect.assertions(1)
    const getFunc = jest.fn()

    pollForChanges(getFunc, () => false, () => 1, 15)
    expect(getFunc).toHaveBeenCalled()
  })

  it('delays for the delay milliseconds on start', async () => {
    expect.assertions(1)

    pollForChanges(() => 1, () => false, () => 1, 15)
    // this quirk is needed to flush the Promise queue
    await runToInitValue() // flushes the "await getFunc" line
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 15)
  })

  it('calls getFunc again after the first delay', async () => {
    expect.assertions(1)
    const getFunc = jest.fn()

    pollForChanges(getFunc, () => false, () => 1, 15)
    await runToFirstDelay()
    expect(getFunc).toHaveBeenCalledTimes(2)
  })

  it('does not call the change listener if hasValueChanged returns falsy', async () => {
    expect.assertions(1)
    const listener = jest.fn()

    pollForChanges(() => 1, () => false, listener, 15)
    await runToFirstDelay()
    expect(listener).not.toHaveBeenCalled()
  })

  it('calls the change listener if hasValueChanged returns truthy', async done => {
    expect.assertions(1)
    let checkOnlyOnce = val => {
      expect(val).toBe(1)
      done()
    }
    const listener = val => {
      checkOnlyOnce(val)
      checkOnlyOnce = () => 1 // this continues to poll in the test, so stop asserting
    }

    pollForChanges(() => 1, () => true, listener, 15)
    await runToFirstDelay()
  })

  it('polls repeatedly', async () => {
    expect.assertions(2)
    const getFunc = jest.fn()

    pollForChanges(getFunc, () => false, () => 1, 15)
    await runToFirstDelay()
    expect(getFunc).toHaveBeenCalledTimes(2)

    await runIteration()
    expect(getFunc).toHaveBeenCalledTimes(3)
  })

  it('does not call change listener if the value has changed but remains unchanged on the next poll', async () => {
    expect.assertions(2)
    const listener = jest.fn()

    let callNumber = 0

    const hasValueChanged = () => {
      if (callNumber++) return false
      return true // trigger a change notification on the first round only
    }

    pollForChanges(() => 1, hasValueChanged, listener, 15)
    await runToFirstDelay()
    await runIteration()

    expect(listener).toHaveBeenCalledTimes(1)

    await runIteration()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
