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

function handleTransaction(sentTransaction, abiEvents, callback) {
  sentTransaction.once('transactionHash', function (hash) {
    callback(null, { event: 'transactionHash', args: { hash } })
  }).on('confirmation', function (confNumber, receipt) {
    callback(null, { event: 'confirmation', args: { confNumber, receipt } })
  }).once('receipt', function (receipt) {
    callback(null, { event: 'receipt', args: { receipt } })
    receipt.logs.forEach((log) => {
      // For each event, let's look at the inputs
      abiEvents.forEach((event) => {
        let topics = log.topics
        if (event.name) {
          // https://web3js.readthedocs.io/en/1.0/web3-eth-abi.html#decodelog
          // topics - Array: An array with the index parameter topics of the log, without the topic[0] if its a non-anonymous event, otherwise with topic[0].
          topics = log.topics.slice(1)
        }
        const decoded = web3.eth.abi.decodeLog(event.inputs, log.data, topics)
        const args = event.inputs.reduce((args, input) => {
          args[input.name] = decoded[input.name]
          return args
        }, {})
        callback(null, { event: event.name, args })
      })
    })
  }).on('error', function (error) {
    callback(error)
  })
}

/**
 * This helper function signs a transaction
 * and sends it.
 * @param {*} param0
 */
function sendTransaction({ to, from, data, value, gas, privateKey, contractAbi = [] }, callback) {

  // Home made event handling since this is not handled correctly by web3 :/
  const abiEvents = contractAbi.filter((item) => {
    return item.type === 'event'
  })

  if (!privateKey) {
    // We are using a third party provider so we do not have a privateKey for the user...
    // We assume this will support sentTransaction
    return handleTransaction(web3.eth.sendTransaction({
      to,
      from,
      value,
      data,
      gas,
    }), abiEvents, callback)
  } else {
    // We process transactions ourselves...
    // Sign first
    web3.eth.accounts.signTransaction({
      to,
      from,
      value,
      data,
      gas,
    }, privateKey)
      .then((tx) => {
        // and send the signature!
        return handleTransaction(web3.eth.sendSignedTransaction(tx.rawTransaction), abiEvents, callback)
      })
  }
}

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

  return sendTransaction({
    to: UnlockContract.networks[networkId].address,
    from: lock.creator.address,
    data: data,
    gas: 1000000,
    privateKey: lock.creator.privateKey,
    contractAbi: UnlockContract.abi,
  }, (error, { event, args }) => {
    if (error) {
      console.error(error)
    }
    if (event === 'transactionHash') {
      transaction.hash = args.hash
      transaction.status = 'submitted'
      dispatch(setTransaction(transaction))
    } else if (event === 'confirmation') {
      transaction.status = 'mined'
      transaction.confirmations += 1
      dispatch(setTransaction(transaction))
    } else if (event === 'NewLock' ) {
      transaction.lock = getLock(args.newLockAddress)
      getAddressBalance(lock.creator.address, (balance) => {
        dispatch(resetAccountBalance(balance))
      })
      dispatch(setTransaction(transaction))
    }
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

  return sendTransaction({
    to: lockAddress,
    from: account.address,
    data: data,
    gas: 1000000,
    value: keyPrice,
    privateKey: account.privateKey,
    contractAbi: LockContract.abi,
  }, (error, { event, args }) => {
    if (error) {
      console.error(error)
    }
    if (event === 'transactionHash') {
      transaction.hash = args.hash
      transaction.status = 'submitted'
      dispatch(setTransaction(transaction))
    } else if (event === 'confirmation') {
      transaction.status = 'mined'
      transaction.confirmations += 1
      dispatch(setTransaction(transaction))
    } else if (event === 'SoldKey') {
      getKey(lockAddress, account, (key) => {
        transaction.key = key
        dispatch(setTransaction(transaction))
      })
      getAddressBalance(account.address, (balance) => {
        dispatch(resetAccountBalance(balance))
      })
    }
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

  return sendTransaction({
    to: lock.address,
    from: account.address,
    data: data,
    gas: 1000000,
    privateKey: account.privateKey,
    contractAbi: LockContract.abi,
  }, (error, { event, args }) => {
    if (error) {
      console.error(error)
    }
    if (event === 'receipt') {
      getAddressBalance(account.address, (balance) => {
        dispatch(resetAccountBalance(balance))
      })
      getAddressBalance(lock.address, (balance) => {
        lock.balance = balance
        dispatch(resetLock(lock))
      })
    }
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