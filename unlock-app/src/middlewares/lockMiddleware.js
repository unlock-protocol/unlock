import { LOCATION_CHANGE } from 'react-router-redux'
import { CREATE_LOCK, SET_LOCK, WITHDRAW_FROM_LOCK } from '../actions/lock'
import { PURCHASE_KEY, SET_KEY } from '../actions/key'
import { SET_ACCOUNT, LOAD_ACCOUNT, CREATE_ACCOUNT } from '../actions/accounts'
import { SET_NETWORK } from '../actions/network'

// import { initWeb3Service, createAccount, loadAccount, createLock, getLock, purchaseKey, getKey, withdrawFromLock } from '../services/web3Service'
import Web3Service from '../services/web3Service'
import { lockUnlessKeyIsValid } from '../services/iframeService'

// This middleware listen to redux events and invokes the services APIs.
export default function lockMiddleware ({ getState, dispatch }) {

  const web3Service = new Web3Service(dispatch)
  web3Service.connect({
    network: getState().network,
  })

  return function (next) {
    return function (action) {
      if (action.type === LOAD_ACCOUNT) {
        web3Service.loadAccount(action.privateKey)
      } else if (action.type === CREATE_ACCOUNT) {
        web3Service.createAccount()
      } else if (action.type === SET_NETWORK) {
        web3Service.connect({
          network: {
            name: action.network,
            account: {},
          },
        })
      } else if (action.type === CREATE_LOCK) {
        // Create a lock
        web3Service.createLock(action.lock)
      } else if (action.type === PURCHASE_KEY) {
        // A key has been purchased
        web3Service.purchaseKey(action.lock.address, action.account, action.lock.keyPrice, '') // TODO change data from ''
      } else if (action.type === SET_KEY) {
        lockUnlessKeyIsValid({key: action.key})
      } else if (action.type === WITHDRAW_FROM_LOCK) {
        web3Service.withdrawFromLock(action.lock, getState().network.account)
      }

      next(action)

      if (action.type === LOCATION_CHANGE) {
        // Location was changed, get the matching lock
        const match = action.payload.pathname.match(/\/lock\/(0x[a-fA-F0-9]{40})$/)
        if (match) {
          web3Service.getLock(match[1])
        }
      } else if (action.type === SET_ACCOUNT) {
        const lock = getState().network.lock
        if (lock) {
          // TODO(julien): isn't lock always set anyway?
          web3Service.getKey(lock.address, action.account)
        }
      } else if (action.type === SET_LOCK) {
        // Lock was changed, get the matching key
        web3Service.getKey(action.lock.address, getState().network.account)
      }

    }
  }
}
