/* eslint promise/prefer-await-to-then: 0 */

import { CREATE_LOCK, GET_LOCK, updateLock, createLock } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'
import { updateAccount } from '../actions/accounts'
import { setError } from '../actions/error'
import {
  addTransaction,
  updateTransaction,
  ADD_TRANSACTION,
  NEW_TRANSACTION,
} from '../actions/transaction'
import { UNLIMITED_KEYS_COUNT } from '../constants'

import { transactionTypeMapping } from '../utils/types'
import { Web3 } from '../utils/Error'

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = web3Service => {
  return ({ getState, dispatch }) => {
    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    /**
     * The Lock was changed.
     * Should we get the balance of the lock owner?
     */
    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]

      // Our app defines a unlimitedKeys boolean
      if (update.maxNumberOfKeys) {
        update.unlimitedKeys = update.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
      }

      // Only dispatch the updates which are more recent than the current value
      if (!lock || !lock.asOf || lock.asOf < update.asOf) {
        dispatch(updateLock(address, update))
      }
    })

    web3Service.on('transaction.updated', (transactionHash, update) => {
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
    })

    web3Service.on('transaction.new', transactionHash => {
      dispatch(
        addTransaction({
          hash: transactionHash,
          network: getState().network.name,
        })
      )
    })

    web3Service.on('error', error => {
      const { message } = error
      // TODO: better handling of these errors? We can't separate them
      // by level right now, so they're all diagnostic.
      dispatch(setError(Web3.Diagnostic(message)))
    })

    return function(next) {
      return function(action) {
        if (action.type === ADD_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === NEW_TRANSACTION) {
          dispatch(startLoading())
          web3Service
            .getTransaction(action.transaction.hash, action.transaction)
            .then(() => {
              dispatch(doneLoading())
            })
        }

        if (action.type === CREATE_LOCK && !action.lock.address) {
          web3Service
            .generateLockAddress(action.lock.owner, action.lock)
            .then(address => {
              action.lock.address = address
              dispatch(createLock(action.lock))
            })
        }

        if (action.type === GET_LOCK) {
          web3Service.getLock(action.address)
        }
        next(action)
      }
    }
  }
}

export default web3Middleware
