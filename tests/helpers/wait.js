/**
 * Helper function which waits for something to be false
 */
const untilIsFalse = async (statement, ...variables) =>
  new Promise(resolve => {
    const waitIfTrue = async () => {
      const isTrue = await page.evaluate(statement, variables)
      if (!isTrue) {
        return resolve()
      }
      return setTimeout(async () => {
        return waitIfTrue()
      }, 10)
    }
    waitIfTrue()
  })

/**
 * Helper function which waits for something to be false
 */
const untilIsTrue = async (statement, ...variables) =>
  new Promise(resolve => {
    const waitIfTrue = async () => {
      const isTrue = await page.evaluate(statement, variables)
      if (isTrue) {
        return resolve()
      }
      return setTimeout(async () => {
        return waitIfTrue()
      }, 10)
    }
    waitIfTrue()
  })

/**
 * Helper function to ensure that a DOM element is gone.
 */
const untilIsGone = async selector =>
  untilIsFalse(_selector => {
    return document.querySelectorAll(_selector).length
  }, selector)

/**
 * Helper function to ensure that loading is done.
 */
const forLoadingDone = async () => untilIsGone('svg[alt="loading"]')

const forIframe = async () => {
  return page.waitForFunction(() => {
    return window.frames.length
  })
}

module.exports = {
  untilIsFalse,
  untilIsTrue,
  untilIsGone,
  forLoadingDone,
  forIframe,
}
