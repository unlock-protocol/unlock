/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import { networks } from '../config'

import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'

import { setAccount, resetAccountBalance } from '../actions/accounts'
import { setLock, resetLock } from '../actions/lock'
import { setKey } from '../actions/key'
import { setTransaction } from '../actions/transaction'

let web3, networkId, dispatch

/**
 * This connects to the web3 service and listens to new blocks
 * @param {object} network
 * @param {function} _dispatch
 */
export const initWeb3Service = ({network}, _dispatch) => {
  dispatch = _dispatch
  const conf = networks[network.name]

  if (!conf.provider) {
    if (conf.protocol === 'ws') {
      conf.provider = new Web3.providers.WebsocketProvider(conf.url)
    } else if (conf.protocol === 'http') {
      conf.provider = new Web3.providers.HttpProvider(conf.url)
    }
  }

  web3 = new Web3(conf.provider)
  if (!network.account.address) {
    web3.eth.getAccounts().then((accounts) => {
      console.log(accounts)
      if(accounts.length === 0) {
        createAccount()
      } else {
        const accountAddress = accounts[0] // take the first one!
        getAddressBalance(accountAddress, (balance) => {
          const account = {
            address: accountAddress,
            balance,
          }
          dispatch(setAccount(account))
        })
      }
    })
  } else {
    // Let's refresh the account balance
    getAddressBalance(network.account.address, (balance) => {
      network.account.balance = balance
      dispatch(setAccount(network.account))
    })
  }

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
export const createLock = (lock) => {
  const unlock = new web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[networkId].address)

  const data = unlock.methods.createLock(
    lock.keyReleaseMechanism,
    lock.expirationDuration,
    lock.expirationTimestamp,
    lock.keyPriceCalculator,
    lock.keyPrice,
    lock.maxNumberOfKeys
  ).encodeABI()

  // The transaction object!
  const transaction = {
    status: 'pending',
    confirmations: 0,
    createdAt: new Date().getTime(),
  }

  // TODO: Race condition? What if another event is triggered at the same time?
  // Actually, is that a problem? Probably not, but we should be listening to these events at all times.
  unlock.once('NewLock', (error, event) => {
    // TODO: reload user account balance to reflect the change!
    transaction.lock = getLock(event.returnValues.newLockAddress)
    getAddressBalance(lock.creator.address, (balance) => {
      dispatch(resetAccountBalance(balance))
    })
    dispatch(setTransaction(transaction))
  })

  web3.eth.accounts.signTransaction({
    to: UnlockContract.networks[networkId].address,
    from: lock.creator.address,
    data: data,
    gas: 1000000,
  }, lock.creator.privateKey).then((tx) => {
    return web3.eth.sendSignedTransaction(tx.rawTransaction)
      .once('transactionHash', function (hash) {
        transaction.hash = hash
        transaction.status = 'submitted'
        dispatch(setTransaction(transaction))
      })
      .on('confirmation', function (confNumber, receipt) {
        transaction.confirmations += 1
        transaction.status = 'mined'
        dispatch(setTransaction(transaction))
      })
      .on('error', function (error) {
        console.log('error', error)
      })
  })
}

/**
 * This loads the account's balance
 * Returns the account
 */
export const getAddressBalance = (address, callback) => {
  web3.eth.getBalance(address, (error, balance) => {
    callback(balance)
  })
}

/**
 * This loads the account matching the private key
 * Returns the account
 */
export const loadAccount = (privateKey) => {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  getAddressBalance(account.address, (balance) => {
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
  getAddressBalance(account.address, (balance) => {
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
    memo: {}, // This includes a memo for functions
  }

  const contract = new web3.eth.Contract(LockContract.abi, address)

  LockContract.abi.forEach((item) => {
    if (item.constant) {
      if (item.inputs.length === 0) {
        if (!lock[item.name]) {
          contract.methods[item.name]().call((error, result) => {
            if (error) {
              // Something happened
            } else {
              lock[item.name] = result
              dispatch(resetLock(lock)) // update the value
            }
          })
        }
        lock[item.name] = undefined
      } else {
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
    }
  })

  // TODO: handle changes!
  lock.balance = null
  web3.eth.getBalance(address, (error, balance) => {
    lock.balance = balance
    dispatch(resetLock(lock))
  })

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

  // The transaction object (conflict if other transactions have not been confirmed yet?)
  // TODO: We have a race condition because this will keep emitting even after
  // confirmation... which is a problem if we trigger other transaction
  const transaction = {
    status: 'pending',
    confirmations: 0,
    createdAt: new Date().getTime(),
  }

  // Trigger an event when the key was sold!
  // TODO: Filter by key owner
  lock.once('SoldKey', {

  }, (error, event) => {
    getKey(lockAddress, account, (key) => {
      transaction.key = key
      dispatch(setTransaction(transaction))
    })
    getAddressBalance(account.address, (balance) => {
      dispatch(resetAccountBalance(balance))
    })
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
        transaction.status = 'submitted'
        transaction.hash = hash
        dispatch(setTransaction(transaction))
      })
      .on('confirmation', function (confNumber, receipt) {
        transaction.status = 'mined'
        transaction.confirmations += 1
        dispatch(setTransaction(transaction))
      })
      .on('error', function (error) {
        console.error('error', error)
      })
  })
}

/**
 * Returns the key to the lockAddress by the account.
 * @param {PropTypes.adress} lockAddress
 * @param {PropTypes.account} account
 * @param {PropTypes.func} callback
 */
export const getKey = (lockAddress, account, callback) => {
  if (!account || !lockAddress) {
    return dispatch(setKey({
      expiration: 0,
    }))
  }
  const lockContract = new web3.eth.Contract(LockContract.abi, lockAddress)

  const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(account.address).call()
  const getKeyDataPromise = lockContract.methods.keyDataFor(account.address).call()
  Promise.all([getKeyExpirationPromise, getKeyDataPromise])
    .then(([expiration, data]) => {
      const key = {
        expiration: parseInt(expiration, 10),
        data,
      }
      if (callback) {
        callback(key)
      }
      dispatch(setKey(key))
    })
}

/**
 * Triggers a transaction to withdraw funds from the lock and assign them to the owner.
 * @param {PropTypes.lock}
 * @param {PropTypes.account} account
*/
export const withdrawFromLock = (lock, account) => {
  const lockContract = new web3.eth.Contract(LockContract.abi, lock.address)
  const data = lockContract.methods.withdraw().encodeABI()

  web3.eth.accounts.signTransaction({
    to: lock.address,
    from: account.address,
    data: data,
    gas: 1000000, // TODO: improve?
  }, account.privateKey).then((tx) => {
    return web3.eth.sendSignedTransaction(tx.rawTransaction)
      .once('transactionHash', function (hash) {
        console.log('hash', hash)
      })
      .once('receipt', function (receipt) {
        console.log('receipt', receipt)
      })
      .on('confirmation', function (confNumber, receipt) {
        console.log('confirmation', confNumber, receipt)
      })
      .on('error', function (error) {
        console.log('error', error)
      })
      .then(function (receipt) {
        // TODO: refresh the account's balance
        getAddressBalance(account.address, (balance) => {
          dispatch(resetAccountBalance(balance))
        })
        getAddressBalance(lock.address, (balance) => {
          lock.balance = balance
          dispatch(resetLock(lock))
        })
        console.log('Mined!', receipt)
      })
  })

}

export default {
  initWeb3Service,
  createLock,
  getKey,
  purchaseKey,
  getLock,
  withdrawFromLock,
}