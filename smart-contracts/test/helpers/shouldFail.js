module.exports = async function shouldFail (promise, expectedRevertReason) {
  const expectedMessage = `VM Exception while processing transaction: revert ${expectedRevertReason}`
  try {
    await promise
  } catch (error) {
    if (error.message !== expectedMessage) {
      throw new Error(`shouldFail reason for revert does not match. Got ${error.message}; expected ${expectedMessage}`)
    }
    return
  }
  throw new Error(`Call should have failed but did not. Expected ${expectedMessage}`)
}
