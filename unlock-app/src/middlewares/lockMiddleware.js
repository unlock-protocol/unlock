import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, SET_LOCK, WITHDRAW_FROM_LOCK, setLock, resetLock } from '../actions/lock'
import { PURCHASE_KEY, SET_KEY, setKey } from '../actions/key'
import { SET_ACCOUNT, LOAD_ACCOUNT, CREATE_ACCOUNT, setAccount, resetAccountBalance } from '../actions/accounts'
import { SET_NETWORK } from '../actions/network'
import { setTransaction } from '../actions/transaction'

import Web3Service from '../services/web3Service'
import { lockUnlessKeyIsValid } from '../services/iframeService'

// This middleware listen to redux events and invokes the services APIs.
export default function lockMiddleware ({ getState, dispatch, fuck }) {

  const web3Service = new Web3Service()

  web3Service.connect({
    network: getState().network,
  }).then((account) => {
    dispatch(setAccount(account))
  })

  return function (next) {
    return function (action) {
      if (action.type === LOAD_ACCOUNT) {
        web3Service.loadAccount(action.privateKey)
          .then((account) => {
            return dispatch(setAccount(account))
          })
      } else if (action.type === CREATE_ACCOUNT) {
        web3Service.createAccount()
          .then((account) => {
            return dispatch(setAccount(account))
          })
      } else if (action.type === SET_NETWORK) {
        web3Service.connect({
          network: {
            name: action.network,
            account: {},
          },
        }).then((account) => {
          return dispatch(setAccount(account))
        })
      } else if (action.type === CREATE_LOCK) {
        // Create a lock
        web3Service.createLock(action.lock, (transaction) => {
          dispatch(setTransaction(transaction))
        }).then((lock) => {
          dispatch(setLock(lock))
          return web3Service.getAddressBalance(action.lock.creator.address)
        }).then((balance) => {
          dispatch(resetAccountBalance(balance))
        })
      } else if (action.type === PURCHASE_KEY) {
        // TODO change data from ''
        web3Service.purchaseKey(action.lock.address, action.account, action.lock.keyPrice, '', (transaction) => {
          dispatch(setTransaction(transaction))
        }).then((key) => {
          dispatch(setKey(key))
          return web3Service.getAddressBalance(action.account.address)
        }).then((balance) => {
          dispatch(resetAccountBalance(balance))
        })
      } else if (action.type === SET_KEY) {
        lockUnlessKeyIsValid({key: action.key})
      } else if (action.type === WITHDRAW_FROM_LOCK) {
        const account = getState().network.account
        web3Service.withdrawFromLock(action.lock, account)
          .then((lock) => {
            return Promise.all([
              web3Service.getAddressBalance(account.address),
              web3Service.getAddressBalance(action.lock.address),
            ])
          }).then(([accountBalance, lockBalance]) => {
            account.balance = accountBalance
            action.lock.balance = lockBalance
            dispatch(resetAccountBalance(account.balance))
            dispatch(resetLock(action.lock))
          })
      }

      next(action)

      if (action.type === LOCATION_CHANGE) {
        // Location was changed, get the matching lock
        const match = action.payload.pathname.match(/\/lock\/(0x[a-fA-F0-9]{40})$/)
        if (match) {
          web3Service.getLock(match[1]).then((lock) => {
            dispatch(resetLock(lock)) // update the lock
          })
        }
      } else if (action.type === SET_ACCOUNT) {
        const lock = getState().network.lock
        if (lock && lock.address) {
          // TODO(julien): isn't lock always set anyway?
          web3Service.getKey(lock.address, action.account)
            .then((key) => {
              dispatch(setKey(key))
            })
        }
      } else if (action.type === SET_LOCK) {
        // Lock was changed, get the matching key
        web3Service.getKey(action.lock.address, getState().network.account)
          .then((key) => {
            dispatch(setKey(key))
          })
      }

    }
  }
}
