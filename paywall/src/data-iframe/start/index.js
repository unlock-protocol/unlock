import setupPostOfficeListener from '../postOfficeListener'
import { addListener } from '../cacheHandler'
import postOffice from '../postOffice'
import { purchaseKey } from './purchaseKeySetup'
import makeSetConfig from './makeSetConfig'

/**
 * @param {window} window the global context (window, self, or global)
 * @param {object} constants the values required to start the blockchain. Specifically:
 *                           - readOnlyProvider
 *                           - unlockAddress
 *                           - blockTime
 *                           - requiredConfirmations
 *                           - locksmithHost
 */
export default async function start(window, constants) {
  // this lazy-loads key purchase code in a non-blocking way
  // so that it will be available as soon as possible
  import(/* webpackPrefetch: true */ '../blockchainHandler/purchaseKey')
  // set up the post office for communicating cache values, errors, and
  // wallet modal notifications to the main window
  const updater = postOffice(window, constants.requiredConfirmations)
  // when the cache changes, we send the new information to the main window
  addListener(updater)
  // listen for events from the main window, which include requests for blockchain
  // data (currently not used, we just push), and requests to purchase a key
  setupPostOfficeListener(
    window,
    updater,
    makeSetConfig(window, updater, constants),
    purchaseKey
  )
}
