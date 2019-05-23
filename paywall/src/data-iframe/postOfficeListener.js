import { setHandler } from '../utils/postOffice'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_DATA_REQUEST,
} from '../paywall-builder/constants'

/**
 * Create the listener to send all data when the main window is ready
 * @param {Function} updater a callback returned from the postOffice used to trigger data sending
 *                           to the main window
 */
export const makeReadyListener = updater =>
  function readyPostOfficeListener() {
    updater('network')
    updater('account')
    updater('balance')
    updater('locks')
  }

/**
 * Create the listener for data
 * @param {Function} logger a logging function like console.log
 * @param {Function} updater a callback returned from the postOffice used to trigger data sending
 *                           to the main window
 */
export const makeRequestListener = (logger, updater) =>
  function requestPostOfficeListener(type) {
    if (typeof type !== 'string') {
      logger('ignoring malformed data')
      return
    }
    if (!['locks', 'account', 'balance', 'network'].includes(type)) {
      logger(`Unknown data type "${type}" requested, ignoring`)
      return
    }
    updater(type)
  }

/**
 * Set up listening for POST_MESSAGE_READY and POST_MESSAGE_DATA_REQUEST from the main window
 * @param {window} window the global context (window, self, global)
 * @param {Function} updater a callback returned from the postOffice used to trigger data sending
 *                           to the main window
 */
export default function setupPostOfficeListener(window, updater) {
  const readyListener = makeReadyListener(updater)
  const requestListener = makeRequestListener(window.console.error, updater)
  setHandler(POST_MESSAGE_READY, readyListener)
  setHandler(POST_MESSAGE_DATA_REQUEST, requestListener)
}
