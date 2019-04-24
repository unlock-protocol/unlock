/* eslint promise/prefer-await-to-then: 0 */

import UnlockJs from '@unlock-protocol/unlock-js'
import { startLoading, doneLoading } from '../actions/loading'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { updateLock, addLock } from '../actions/lock'
import {
  addTransaction,
  updateTransaction,
  NEW_TRANSACTION,
  UPDATE_TRANSACTION,
} from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { setError } from '../actions/error'
import { transactionTypeMapping } from '../utils/types'
import { lockRoute } from '../utils/routes'
import { addKey, updateKey } from '../actions/key'

const { Web3Service } = UnlockJs

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  } = config
  return ({ dispatch, getState }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })

    // When explicitly retrieved
    web3Service.on('key.updated', (id, key) => {
      dispatch(addKey(id, key))
    })

    // When transaction succeeds
    web3Service.on('key.saved', (id, key) => {
      dispatch(addKey(id, key))
    })

    web3Service.on('error', error => {
      dispatch(setError(error.message))
    })

    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    web3Service.on('transaction.new', transactionHash => {
      dispatch(
        addTransaction({
          hash: transactionHash,
          network: getState().network.name,
        })
      )
    })

    web3Service.on('transaction.updated', (transactionHash, update) => {
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
    })

    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]
      if (lock) {
        dispatch(updateLock(address, update))
      } else {
        dispatch(addLock(address, update))
      }
    })

    return function(next) {
      return function(action) {
        next(action)

        const {
          account,
          router: {
            location: { pathname, hash },
          },
        } = getState()
        const { lockAddress } = lockRoute(pathname + hash)
        const accountAddress = account && account.address

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          // If there is no lock address
          if (!lockAddress) {
            // TODO: when the account has been updated we should reset web3Service and remove all listeners
            // So that pending API calls do not interract with our "new" state.
            web3Service.refreshAccountBalance(action.account)
            dispatch(startLoading())
            // TODO: only do that when on the page to create events because we do not need the list of locks for other users.
            web3Service
              .getPastLockCreationsTransactionsForUser(action.account.address)
              .then(lockCreations => {
                dispatch(doneLoading())
                lockCreations.forEach(lockCreation => {
                  web3Service.getTransaction(lockCreation.transactionHash)
                })
              })
          }
          // If there is a lock address, let's fetch the user's key
          if (lockAddress) {
            web3Service.getKeyByLockForOwner(
              lockAddress,
              action.account.address
            )
          }
        }

        if (action.type === SET_PROVIDER || action.type === SET_NETWORK) {
          // for both of these actions, the lock state is invalid, and must be refreshed.
          if (lockAddress) {
            web3Service.getLock(lockAddress)
          }
        }

        // When a new transaction was created, retrieve it
        if (action.type === NEW_TRANSACTION) {
          web3Service.getTransaction(
            action.transaction.hash,
            action.transaction
          )
        }

        const keyId = `${lockAddress}-${accountAddress}`
        if (action.type === UPDATE_TRANSACTION) {
          const existingTransaction = getState().transactions[action.hash]
          if (
            (existingTransaction.to === lockAddress &&
              existingTransaction.from === accountAddress) ||
            existingTransaction.key === keyId
          ) {
            // this is key purchase transaction from us to the lock!
            const key = getState().keys[keyId]

            if (key) {
              dispatch(
                updateKey(keyId, {
                  ...key,
                  transactions: {
                    ...key.transactions,
                    [action.hash]: existingTransaction,
                  },
                })
              )
            } else {
              dispatch(
                addKey(keyId, {
                  lock: lockAddress,
                  owner: accountAddress,
                  expiration: 0,
                  data: null,
                  id: keyId,
                  transactions: {
                    [action.hash]: existingTransaction,
                  },
                })
              )
            }
          }
        }
      }
    }
  }
}

export default web3Middleware
