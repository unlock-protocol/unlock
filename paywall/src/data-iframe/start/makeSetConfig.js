import connectToBlockchain from './connectToBlockchain'
import syncToCache from './syncToCache'

/**
 * Create the callback that will be used when paywall configuration is received.
 *
 * The primary repsonsibility of this callback is to trigger sending the current cache
 * values to the main window, followed by connecting to the blockchain handler and
 * providing its onChange handler for passing updates to the cache, and
 * error/walletModal updates directly to the main window.
 *
 * @param {window} window the current global context (window, self, global)
 * @param {Function} updater the updater that will be used to trigger sending
 *                           of data to the main window
 * @param {object} constants the values required to start the blockchain. Specifically:
 *                           - readOnlyProvider
 *                           - unlockAddress
 *                           - blockTime
 *                           - requiredConfirmations
 *                           - locksmithHost
 */
const makeSetConfig = (window, updater, constants) =>
  async function setConfig(configValue) {
    // now we can retrieve the cached data
    updater('network')
    updater('account')
    updater('balance')
    updater('locks')

    // bridge from the blockchain to the cache
    // and to the main window for errors/wallet modal
    const onChange = updates => {
      // pass errors on directly
      if (updates.error) {
        updater('error', updates.error)
        return
      }
      // pass wallet feedback notifications on directly
      if (updates.walletModal) {
        updater('walletModal')
        return
      }
      // for everything else, it stores it in the cache
      // cache listeners will transmit it to the script
      syncToCache(window, updates)
    }
    onChange(
      await connectToBlockchain({
        ...constants,
        config: configValue,
        window,
        onChange,
      })
    )
  }

export default makeSetConfig
