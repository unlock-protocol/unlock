const MAX_RETRIES = 1
const RETRY_DELAY = 500

/** Retry transaction */
const executeAndRetry = async (
  promise: Promise<any>,
  tries = 0
): Promise<any> => {
  try {
    return await promise
  } catch (error) {
    // The goal here is to catch nonce issues
    // (sometimes 2 concurrent processes might send a transaction with the same nonce)
    if (tries > MAX_RETRIES) {
      throw error
    } else {
      // Exponential retries
      return new Promise((resolve) => {
        const delay = RETRY_DELAY * (tries + 1)
        setTimeout(() => {
          const result = executeAndRetry(promise, tries + 1)
          return resolve(result)
        }, delay)
      })
    }
  }
}

export default executeAndRetry
