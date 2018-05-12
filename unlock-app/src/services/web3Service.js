/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'

import { setAccount } from '../actions/accounts'
import { setLock, resetLock } from '../actions/lock'
import { setKey } from '../actions/key'

let web3, networkId, dispatch

/**
 * This connects to the web3 service and listens to new blocks
 * @param {object} network
 * @param {function} _dispatch
 */
export const initWeb3Service = ({network, provider}, _dispatch) => {
  dispatch = _dispatch
  if (!provider) {
    if (network.protocol === 'ws') {
      provider = new Web3.providers.WebsocketProvider(network.url)
    } else if (network.protocol === 'http') {
      provider = new Web3.providers.HttpProvider(network.url)
    }
  }
  web3 = new Web3(provider)

  // Set the default account (only if none is set?)
  createAccount()

  // Get the network id
  web3.eth.net.getId().then((_networkId) => {
    networkId = _networkId
    // TODO: set the account from the provider?
  })

  // Listen to events on the Unlock smart contract to show newly created locks!
  // We should only show the ones owned by the current user maybe?
}

/**
 * Creates a lock on behalf of the user `from`.
 * @param {PropTypes.lock} lock
 * @param {PropTypes.account} from
 */
export const createLock = (lock, from) => {
  const unlock = new web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[networkId].address)
  const data = unlock.methods.createLock(...Object.values(lock)).encodeABI()

  // TODO: Race condition? What if another event is triggered at the same time?
  // Actually, is that a problem? Probably not, but we should be listening to these events at all times.
  unlock.once('NewLock', (error, event) => {
    // TODO: reload user account balance to reflect the change!
    getLock(event.returnValues.newLockAddress)
  })

  web3.eth.accounts.signTransaction({
    to: UnlockContract.networks[networkId].address,
    from: from.address,
    data: data,
    gas: 1000000,
  }, from.privateKey).then((tx) => {
    return web3.eth.sendSignedTransaction(tx.rawTransaction)
      .once('transactionHash', function (hash) {
        // console.log('hash', hash)
      })
      .once('receipt', function (receipt) {
        // console.log('receipt', receipt)
      })
      .on('confirmation', function (confNumber, receipt) {
        // console.log('confirmation', confNumber, receipt)
      })
      .on('error', function (error) {
        console.log('error', error)
      })
      .then(function (receipt) {
        // console.log('Mined!', receipt)
      })
  })
}

/**
 * This loads the account matching the private key
 * Returns the account
 */
export const loadAccount = (privateKey) => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  web3.eth.getBalance(account.address, (error, balance) => {
    account.balance = balance
    dispatch(setAccount(account))
  })
}

/**
 * This creates an account on the current network.
 * Returns the account
 */
export const createAccount = () => {
  const account = web3.eth.accounts.create()
  web3.eth.getBalance(account.address, (error, balance) => {
    account.balance = balance
    dispatch(setAccount(account))
  })
}

/**
 * This gets the lock object from the stored data in the blockchain
 * @param {PropTypes.adress} address
 */
export const getLock = (address) => {
  let lock = {
    address,
    memo: {}, // This includes a memo
  }

  const contract = new web3.eth.Contract(LockContract.abi, address)

  LockContract.abi.forEach((item) => {
    if (item.constant) {
      lock[item.name] = function (...args) {
        if (!lock.memo[item.name]) {
          lock.memo[item.name] = {} // create the memo
        }
        if (lock.memo[item.name][args]) {
          return lock.memo[item.name][args]
        } else {
          // we do not have the memod value... so let's return undefined and retrieve it!
          contract.methods[item.name](...args).call((error, result) => {
            if (error) {
              // Something happened
            } else {
              // set the memo
              lock.memo[item.name][args] = result
              dispatch(resetLock(lock))
            }
          })
          return undefined // By default we return undefined?
        }
      }
    }
  })

  // Let's also add a method to get the balance!
  lock.memo.balance = null
  lock.balance = () => {
    if (lock.memo.balance) {
      return lock.memo.balance
    }
    web3.eth.getBalance(address, (error, balance) => {
      lock.memo.balance = balance
      dispatch(resetLock(lock))
    })
  }

  dispatch(setLock(lock))
  // TODO: methods, events, changes?
  return lock
}

/**
 * Purchase a key to a lock by account.
 * @param {PropTypes.adress} lockAddress
 * @param {PropTypes.account} account
 * @param {PropTypes.number} keyPrice
 * @param {PropTypes.string} keyData // This needs to maybe be less strict. (binary data)
 */
export const purchaseKey = (lockAddress, account, keyPrice, keyData) => {
  const lock = new web3.eth.Contract(LockContract.abi, lockAddress)
  const data = lock.methods.purchase(keyData).encodeABI()

  // Trigger an event when the key was sold!
  // TODO: Filter by key owner
  lock.once('SoldKey', {

  }, (error, event) => {
    getKey(lockAddress, account)
  })

  web3.eth.accounts.signTransaction({
    to: lockAddress,
    from: account.address,
    data: data,
    value: keyPrice,
    gas: 1000000, // TODO: improve?
  }, account.privateKey).then((tx) => {
    return web3.eth.sendSignedTransaction(tx.rawTransaction)
      .once('transactionHash', function (hash) {
        // console.log('hash', hash)
      })
      .once('receipt', function (receipt) {
        // console.log('receipt', receipt)
      })
      .on('confirmation', function (confNumber, receipt) {
        // console.log('confirmation', confNumber, receipt)
      })
      .on('error', function (error) {
        console.log('error', error)
      })
      .then(function (receipt) {
        // console.log('Mined!', receipt)
      })
  })
}

/**
 * Returns the key to the lockAddress by the account.
 * @param {PropTypes.adress} lockAddress
 * @param {PropTypes.account} account
 */
export const getKey = (lockAddress, account) => {
  if (!account) {
    return dispatch(setKey({
      expiration: 0,
    }))
  }
  const lockContract = new web3.eth.Contract(LockContract.abi, lockAddress)
  const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(account.address).call()
  const getKeyDataPromise = lockContract.methods.keyDataFor(account.address).call()
  Promise.all([getKeyExpirationPromise, getKeyDataPromise])
    .then(([expiration, data]) => {
      dispatch(setKey({
        expiration: parseInt(expiration, 10),
        data,
      }))
    })
}

export default {
  initWeb3Service,
  createLock,
  getKey,
  purchaseKey,
  getLock,
}