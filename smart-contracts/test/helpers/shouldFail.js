module.exports = async function shouldFail(promise, expectedRevertReason) {
  try {
    await promise
  } catch (error) {
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
    // Using `startsWith` as some error.message may include '-- Reason given: ${expectedRevertReason}.'
    if (error.message.startsWith(expectedMessage)) {
      return
    }

    // Check for an alternate message format
    expectedMessage = 'exited with an error (status 0).'
    if (expectedRevertReason) {
      expectedMessage += ` Reason given: ${expectedRevertReason}.`
    }

    if (error.message.includes(expectedMessage)) {
      return
    }

    // Check for an alternate message format
    expectedMessage =
      'Error: shouldFail reason for revert does not match. Got "Transaction has been reverted by the EVM:'

    if (error.message.startsWith(expectedMessage)) {
      return
    }

    // Check for an alternate message format
    expectedMessage = 'VM Exception while processing transaction: revert'
    if (expectedRevertReason) {
      expectedMessage += ` ${expectedRevertReason}`
    }

    if (error.message === expectedMessage) {
      return
    }

    throw new Error(
      `shouldFail reason for revert does not match. Got "${
        error.message
      }"; expected "${expectedRevertReason}"`
    )
  }

  throw new Error(
    `Call should have failed but did not. Expected "${expectedRevertReason}"`
  )
}
