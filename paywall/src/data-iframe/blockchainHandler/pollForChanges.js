import { delayPromise } from '../../utils/promises'

/**
 * Compare 2 things and return truthy if they are different
 *
 * @callback compareFunc
 * @param {*} oldValue
 * @param {*} newValue
 * @returns {bool} true if the values are different
 */

/**
 * @callback changeListener
 * @param {*} newValue
 */

/**
 * @callback continuePolling
 * @param {*} currentValue
 * @returns {bool} true if the polling should continue
 */

/**
 * Poll for changes every 5 seconds in something, and call the changeListener when it changes
 *
 * @param {Function} getCurrentValue should return the current value(s) we are polling for changes
 * @param {compareFunc} hasValueChanged
 * @param {continuePolling} continuePolling
 * @param {changeListener} changeListener
 * @param {int} delay
 */
export default async function pollForChanges(
  getCurrentValue,
  hasValueChanged,
  continuePolling,
  changeListener,
  delay
) {
  let before = await getCurrentValue()
  while (await continuePolling(before)) {
    await delayPromise(delay)
    const after = await getCurrentValue()
    if (await hasValueChanged(before, after)) {
      changeListener(after)
      before = after
    }
  }
}
