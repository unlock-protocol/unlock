import pollForChanges from '../../../data-iframe/blockchainHandler/pollForChanges'

// note: the "await Promise.resolve()" calls cause our test to "attach" to the await calls in the function.
// without them, the function will run after the test has completed.
describe('pollForChanges', () => {
  // defaults
  const getCurrentValue = () => 1
  const hasValueChanged = () => false
  let continuePolling
  const changeListener = () => 1
  function pollXTimes(X) {
    let num = X
    return () => num--
  }

  async function runToInitValue() {
    await Promise.resolve() // flushes the "await getCurrentValue" line
  }
  // run the pollForChanges up to the next iteration
  async function runToFirstDelay() {
    await runToInitValue() // flushes the "await getCurrentValue" line
    await Promise.resolve() // flushes the continuePolling promise
    jest.runOnlyPendingTimers() // flushes the delayPromise setTimeout
    await Promise.resolve() // flushes the delayPromise promise
  }

  // this should be run after "runToInitValue" and then can be run repeatedly
  async function runIteration() {
    await Promise.resolve() // flushes the "await continuePolling" line
    await Promise.resolve() // flushes the "await getCurrentValue" line
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
    continuePolling = pollXTimes(1)
  })

  it('calls getCurrentValue on start', () => {
    expect.assertions(1)
    const getCurrentValue = jest.fn()

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    expect(getCurrentValue).toHaveBeenCalled()
  })

  it('delays for the delay milliseconds on start', async () => {
    expect.assertions(1)

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToInitValue() // flushes the "await getCurrentValue" line
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 15)
  })

  it('calls getCurrentValue again after the first delay', async () => {
    expect.assertions(1)
    const getCurrentValue = jest.fn()

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToFirstDelay()
    expect(getCurrentValue).toHaveBeenCalledTimes(2)
  })

  it('does not call the change listener if hasValueChanged returns falsy', async () => {
    expect.assertions(1)
    const changeListener = jest.fn()
    const hasValueChanged = () => false

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToInitValue()
    await runIteration()
    expect(changeListener).not.toHaveBeenCalled()
  })

  it('calls the change listener if hasValueChanged returns truthy', async done => {
    expect.assertions(1)
    const hasValueChanged = () => true
    const changeListener = val => {
      expect(val).toBe(1)
      done()
    }

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToInitValue()
    await runIteration()
  })

  it('polls repeatedly, and only as many times as requested', async () => {
    expect.assertions(4)
    const getCurrentValue = jest.fn()
    const continuePolling = pollXTimes(3)

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToFirstDelay()
    expect(getCurrentValue).toHaveBeenCalledTimes(2)

    await runIteration()
    expect(getCurrentValue).toHaveBeenCalledTimes(3)

    await runIteration()
    expect(getCurrentValue).toHaveBeenCalledTimes(4)

    await runIteration()
    expect(getCurrentValue).toHaveBeenCalledTimes(4)
  })

  it('does not call change listener if the value has changed but remains unchanged on the next poll', async () => {
    expect.assertions(2)
    const changeListener = jest.fn()
    const continuePolling = pollXTimes(2)
    let callNumber = 0

    const hasValueChanged = () => {
      if (callNumber++) return false
      return true // trigger a change notification on the first round only
    }

    pollForChanges(
      getCurrentValue,
      hasValueChanged,
      continuePolling,
      changeListener,
      15
    )
    await runToFirstDelay()
    await runIteration()

    expect(changeListener).toHaveBeenCalledTimes(1)

    await runIteration()
    expect(changeListener).toHaveBeenCalledTimes(1)
  })
})
