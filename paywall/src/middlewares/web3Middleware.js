/* eslint promise/prefer-await-to-then: 0 */

import { LOCATION_CHANGE } from 'connected-react-router'
import { Web3Service } from '@unlock-protocol/unlock-js'

import { ADD_LOCK, UPDATE_LOCK, addLock, updateLock } from '../actions/lock'
import { updateKey, addKey } from '../actions/key'
import { updateAccount, SET_ACCOUNT } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
  NEW_TRANSACTION,
} from '../actions/transaction'

import { lockRoute } from '../utils/routes'

import configure from '../config'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

const {
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
} = configure()

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
export default function web3Middleware({ getState, dispatch }) {
  const web3Service = new Web3Service({
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  })

  web3Service.on('account.updated', (account, update) => {
    dispatch(updateAccount(update))
  })

  /**
   * When a lock was saved, we update it, as well as its transaction and
   * refresh the balance of its owner and refresh its content
   */
  web3Service.on('lock.saved', (lock, address) => {
    web3Service.refreshAccountBalance(getState().account)
    web3Service.getLock(address)
    web3Service.getPastLockTransactions(address) // This is costly and not useful for the paywall app...
  })

  /**
   * The Lock was changed.
   * Should we get the balance of the lock owner?
   */
  web3Service.on('lock.updated', (address, update) => {
    const lock = getState().locks[address]
    if (lock) {
      // Only dispatch the updates which are more recent than the current value
      if (!lock.asOf || lock.asOf < update.asOf) {
        dispatch(updateLock(lock.address, update))
      }
    } else {
      dispatch(addLock(address, update))
    }
  })

  /**
   * When a key was saved, we reload the corresponding lock because
   * it might have been updated (balance, outstanding keys...)
   */
  web3Service.on('key.saved', (keyId, key) => {
    const { account } = getState()
    web3Service.getLock(key.lock)
    if (account && account.address === key.owner) {
      web3Service.refreshAccountBalance(getState().account)
    }
    web3Service.getKeyByLockForOwner(key.lock, key.owner)
  })

  web3Service.on('key.updated', (id, update) => {
    if (getState().keys[id]) {
      dispatch(updateKey(id, update))
    } else {
      // That key does not exist yet
      dispatch(addKey(id, update))
    }
  })

  web3Service.on('transaction.updated', (transactionHash, update) => {
    dispatch(updateTransaction(transactionHash, update))
  })

  web3Service.on('transaction.new', transactionHash => {
    dispatch(
      addTransaction({
        hash: transactionHash,
      })
    )
  })

  web3Service.on('error', error => {
    dispatch(setError(error.message))
  })

  return function(next) {
    return function(action) {
      if (action.type === ADD_TRANSACTION) {
        web3Service.getTransaction(action.transaction.hash)
      }

      if (action.type === NEW_TRANSACTION) {
        web3Service.getTransaction(action.transaction.hash, action.transaction)
      }

      next(action)

      const {
        account,
        router: {
          location: { pathname, hash },
        },
        locks,
      } = getState()
      const { lockAddress, transaction } = lockRoute(pathname + hash)

      if (
        [SET_PROVIDER, SET_NETWORK, SET_ACCOUNT, LOCATION_CHANGE].includes(
          action.type
        )
      ) {
        if (transaction) {
          dispatch(
            addTransaction({
              hash: transaction,
            })
          )
        }
      }

      if (action.type === SET_PROVIDER || action.type === SET_NETWORK) {
        // for both of these actions, the lock state is invalid, and must be refreshed.
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }

      // note: this needs to be after the reducer has seen it, because refreshAccountBalance
      // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
      // SET_ACCOUNT has reached it first, and throws an exception. Putting it after the
      // reducer has a chance to populate state removes this race condition.
      if (action.type === SET_ACCOUNT) {
        // TODO: when the account has been updated we should reset web3Service and remove all listeners
        // So that pending API calls do not interract with our "new" state.
        web3Service.refreshAccountBalance(action.account)

        if (lockAddress) {
          web3Service.getKeyByLockForOwner(lockAddress, action.account.address)
        }
      }

      if (action.type === ADD_LOCK || action.type == UPDATE_LOCK) {
        const lock = locks[action.address]
        // this is quite different from the code on line 160, as it uses the lock from the action
        // line 160 uses the lock from the current URL
        if (account) {
          web3Service.getKeyByLockForOwner(lock.address, account.address)
        }
      } else if (
        action.type === LOCATION_CHANGE &&
        action.payload.location &&
        action.payload.location.pathname
      ) {
        // Location was changed, get the matching lock
        if (lockAddress) {
          web3Service.getLock(lockAddress)
        }
      }
    }
  }
}
