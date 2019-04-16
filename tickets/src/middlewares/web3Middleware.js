/* eslint promise/prefer-await-to-then: 0 */

import UnlockJs from '@unlock-protocol/unlock-js'
import { startLoading, doneLoading } from '../actions/loading'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { addTransaction, updateTransaction } from '../actions/transaction'
import { transactionTypeMapping } from '../utils/types'
import { setError } from '../actions/error'

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
  return ({ dispatch }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
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

    return function(next) {
      return function(action) {
        next(action)

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          // TODO: when the account has been updated we should reset web3Service and remove all listeners
          // So that pending API calls do not interract with our "new" state.
          web3Service.refreshAccountBalance(action.account)
          dispatch(startLoading())
          web3Service
            .getPastLockCreationsTransactionsForUser(action.account.address)
            .then(lockCreations => {
              dispatch(doneLoading())
              lockCreations.forEach(lockCreation => {
                web3Service.getTransaction(lockCreation.transactionHash)
              })
            })
        }
      }
    }
  }
}

export default web3Middleware
