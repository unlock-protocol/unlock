module.exports = async function shouldFail (promise, expectedRevertReason) {
  let expectedMessage = `VM Exception while processing transaction: `
  if (expectedRevertReason === 'invalid opcode') {
    expectedMessage += expectedRevertReason
  } else {
    expectedMessage += `revert`
    if (expectedRevertReason && !process.env.TEST_COVERAGE) {
      expectedMessage += ` ${expectedRevertReason}`
    }
  }

  try {
    await promise
  } catch (error) {
    if (error.message !== expectedMessage) {
      expectedMessage = 'Returned error: ' + expectedMessage // Depending on the source, the error may differ slightly
      if (error.message !== expectedMessage) {
        throw new Error(`shouldFail reason for revert does not match. Got "${error.message}"; expected "${expectedMessage}"`)
      }
    }
    return
  }
  throw new Error(`Call should have failed but did not. Expected "${expectedMessage}"`)
}
