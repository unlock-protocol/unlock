module.exports = async function shouldFail(promise, expectedRevertReason) {
  let expectedMessage =
    'Returned error: VM Exception while processing transaction: '
  if (expectedRevertReason === 'invalid opcode') {
    expectedMessage += expectedRevertReason
  } else {
    expectedMessage += 'revert'
    if (expectedRevertReason && !process.env.TEST_COVERAGE) {
      expectedMessage += ` ${expectedRevertReason}`
    }
  }

  try {
    await promise
  } catch (error) {
    // Using `startsWith` as some error.message may include '-- Reason given: ${expectedRevertReason}.'
    if (!error.message.startsWith(expectedMessage)) {
      // Check for an alternate message format
      expectedMessage = 'exited with an error (status 0).'
      if (expectedRevertReason) {
        expectedMessage += ` Reason given: ${expectedRevertReason}.`
      }

      if (!error.message.includes(expectedMessage)) {
        throw new Error(
          `shouldFail reason for revert does not match. Got "${
            error.message
          }"; expected "${expectedMessage}"`
        )
      }
    }
    return
  }
  throw new Error(
    `Call should have failed but did not. Expected "${expectedMessage}"`
  )
}
