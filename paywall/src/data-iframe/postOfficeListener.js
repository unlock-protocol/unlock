import { setHandler } from '../utils/postOffice'
import {
  POST_MESSAGE_DATA_REQUEST,
  POST_MESSAGE_CONFIG,
  POST_MESSAGE_PURCHASE_KEY,
} from '../paywall-builder/constants'
import { isValidPaywallConfig } from '../utils/validators'
import { ACCOUNT_REGEXP } from '../constants'

/**
 * Create the listener to respond to the configuration, which lists all locks on the page
 * @param {Function} setConfig a callback that accepts the configuration. This is used to
 *                             get the list of locks to monitor
 */
export const makeConfigListener = (logger, setConfig) =>
  function configPostOfficeListener(config) {
    if (isValidPaywallConfig(config)) {
      setConfig(config)
    } else {
      logger('ignoring malformed paywall config')
    }
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

export const makePurchaseKeyListener = (logger, purchase) =>
  function purchaseKeyPostOfficeListener(purchaseInfo) {
    if (!purchaseInfo || typeof purchaseInfo !== 'object') {
      logger('ignoring malformed purchase request')
      return
    }
    if (typeof purchaseInfo.lock !== 'string') {
      logger('ignoring malformed purchase request')
      return
    }
    if (purchaseInfo.extraTip && typeof purchaseInfo.extraTip !== 'string') {
      logger('ignoring malformed purchase request')
      return
    }
    const { lock, extraTip } = purchaseInfo
    if (
      !lock.match(ACCOUNT_REGEXP) ||
      (extraTip && !extraTip.match(/^[0-9]+$/))
    ) {
      logger('ignoring malformed purchase request')
      return
    }
    purchase(lock, extraTip)
  }

/**
 * Set up listening for POST_MESSAGE_READY and POST_MESSAGE_DATA_REQUEST from the main window
 * @param {window} window the global context (window, self, global)
 * @param {Function} updater a callback returned from the postOffice used to trigger data sending
 *                           to the main window
 */
export default function setupPostOfficeListener(
  window,
  updater,
  setConfig,
  purchase
) {
  const configListener = makeConfigListener(window.console.error, setConfig)
  const requestListener = makeRequestListener(window.console.error, updater)
  const purchaseListener = makePurchaseKeyListener(
    window.console.error,
    purchase
  )
  setHandler(POST_MESSAGE_CONFIG, configListener)
  setHandler(POST_MESSAGE_DATA_REQUEST, requestListener)
  setHandler(POST_MESSAGE_PURCHASE_KEY, purchaseListener)
}
