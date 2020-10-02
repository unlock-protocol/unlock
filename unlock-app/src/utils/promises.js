/* eslint-disable import/prefer-default-export */

/**
 * delay for ms milliseconds, then return the number of ms to resolve
 */
export function delayPromise(ms) {
  return new Promise((resolve) => setTimeout(resolve.bind(null, ms), ms))
}
