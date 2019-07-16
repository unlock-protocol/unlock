import setupPostOfficeListener from '../postOfficeListener'
import { addListener } from '../cacheHandler'
import postOffice from '../postOffice'
import { purchaseKey } from './purchaseKeySetup'
import makeSetConfig from './makeSetConfig'
import { POST_MESSAGE_INITIATED_TRANSACTION } from '../../paywall-builder/constants'

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
  const { blockChainUpdater, addHandler } = postOffice(window, constants)
  // when the cache changes, we send the new information to the main window
  addListener(blockChainUpdater)
  // create the listener setup function for POST_MESSAGE_INITIATED_TRANSACTION
  // this listener cannot be added until the paywall config has been retrieved,
  // the blockchain has been loaded, and we have a closure created that
  // can be used to refresh data from the chain.
  // This is used when a user with an unlock account initiates a key purchase
  // transaction in the unlock-app iframe. At this stage, we will need to
  // refresh the transactions in order to monitor the transaction
  const addTransactionInitiatedListener = retrieveChainData => {
    addHandler(POST_MESSAGE_INITIATED_TRANSACTION, () => {
      // retrieve the most up-to-date transactions and chain data
      retrieveChainData()
    })
  }
  // listen for events from the main window, which include requests for blockchain
  // data (currently not used, we just push), and requests to purchase a key
  setupPostOfficeListener(
    window,
    blockChainUpdater,
    makeSetConfig(
      window,
      blockChainUpdater,
      constants,
      addTransactionInitiatedListener
    ),
    purchaseKey,
    addHandler
  )
  // start the ball rolling
  blockChainUpdater('ready')
}
