/* eslint-disable import/prefer-default-export */

/**
 * note: tried a few other ways of doing this.
 * 1. importing the delayPromise from promises and using that (causes stack overflow in tests)
 * 2. just mocking it out with ms => Promise.resolve(ms) (stack overflow)
 *
 * This is the only solution that works
 */
export const delayPromise = jest.fn(function delayPromise(ms) {
  return new Promise((resolve) => setTimeout(resolve.bind(null, ms), ms))
})
