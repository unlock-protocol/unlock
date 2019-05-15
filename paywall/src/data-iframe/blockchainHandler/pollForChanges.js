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
 * Poll for changes every 5 seconds in something, and call the changeListener when it changes
 *
 * @param {Function} getFunc should return the current value(s) we are polling for changes
 * @param {compareFunc} hasValueChanged
 * @param {changeListener} changeListener
 * @param {int} delay
 */
export default async function pollForChanges(
  getFunc,
  hasValueChanged,
  changeListener,
  delay
) {
  let before = await getFunc()
  while (true) {
    await delayPromise(delay)
    const after = await getFunc()
    if (await hasValueChanged(before, after)) {
      changeListener(after)
      before = after
    }
  }
}
