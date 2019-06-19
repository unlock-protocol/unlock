import { iframePostOffice } from '../utils/postOffice'
import {
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UPDATE_LOCKS,
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_NETWORK,
  POST_MESSAGE_UPDATE_WALLET,
  POST_MESSAGE_ERROR,
  POST_MESSAGE_READY,
} from '../paywall-builder/constants'
import { getFormattedCacheValues } from './cacheHandler'

/**
 * Communicate from the data iframe to the main window when an update occurs
 *
 * If any data changes that affects account, network, locks, keys, or transactions,
 * the callback returned from this function is used to pass this to the main window
 * script.
 *
 * The format of the message is simply a one-word description of what had changed, with
 * possible values "locks", "account", "balance", "network" and "walletModal."
 *
 * The "locks" event should be sent for any changes to locks, keys or transactions
 * which includes when the user account changes, as this indirectly affects keys and
 * transactions.
 *
 * The callback also sends "unlocked" and "locked" events to the main window, based on
 * the status of the lock/key pairs.
 * @param {window} window the global context (window, self, global)
 * @param {number} requiredConfirmations the minimum number of confirmations for a key to be valid
 * @returns {Function} a callback that should be passed one of "locks", "account", "balance",
 *                     "network" or "walletModal" to trigger a post of changed data to the main window
 */
export default function postOffice(window, requiredConfirmations) {
  const { postMessage, addHandler } = iframePostOffice(
    window,
    'data iframe',
    'main window'
  )

  const actions = {
    unlocked(unlockedLocks) {
      postMessage(POST_MESSAGE_UNLOCKED, unlockedLocks)
    },
    locked() {
      postMessage(POST_MESSAGE_LOCKED)
    },
    locks(locks) {
      postMessage(POST_MESSAGE_UPDATE_LOCKS, locks)
    },
    account(account) {
      postMessage(POST_MESSAGE_UPDATE_ACCOUNT, account)
    },
    balance(balance) {
      postMessage(POST_MESSAGE_UPDATE_ACCOUNT_BALANCE, balance)
    },
    network(network) {
      postMessage(POST_MESSAGE_UPDATE_NETWORK, network)
    },
    walletModal() {
      postMessage(POST_MESSAGE_UPDATE_WALLET)
    },
    ready() {
      postMessage(POST_MESSAGE_READY)
    },
    error(error) {
      postMessage(POST_MESSAGE_ERROR, error)
    },
  }

  const lockHandler = cachedData => {
    actions.locks(cachedData.locks)
    const unlockedLockAddresses = Object.values(cachedData.locks)
      .filter(lock =>
        ['submitted', 'pending', 'valid', 'confirming'].includes(
          lock.key.status
        )
      )
      .map(lock => lock.address)

    if (unlockedLockAddresses.length) {
      actions.unlocked(unlockedLockAddresses)
    } else {
      actions.locked()
    }
  }

  return {
    blockChainUpdater: async (update, content) => {
      const cachedData = await getFormattedCacheValues(
        window,
        requiredConfirmations
      )
      switch (update) {
        case 'ready':
          actions.ready()
          break
        case 'locks':
          lockHandler(cachedData)
          break
        case 'account':
        case 'balance':
          actions[update](cachedData[update])
          // when account changes, so does the keys on locks
          lockHandler(cachedData)
          break
        case 'network':
          if (cachedData.networkId === null) return
          actions.network(cachedData.networkId)
          break
        case 'walletModal':
          actions.walletModal()
          break
        case 'error':
          actions.error(content.message ? content.message : content)
          break
      }
    },
    addHandler,
    postMessage,
  }
}
