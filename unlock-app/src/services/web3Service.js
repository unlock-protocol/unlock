/* eslint no-console: 0 */  // TODO: remove me when this is clean

import Web3 from 'web3'
import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'

import { accountsFetched, setAccount } from '../actions/accounts'
import { setLock, resetLock } from '../actions/lock'
import { setKey } from '../actions/key'

let web3, networkId, dispatch

/**
 * Method to retrieve accounts on the node...
 * This will of course be removed soon since accounts are not managed on the node!
 */
export const getAccounts = () => {
  // We should only do that when applicable (IE, we have no accounts)!
  web3.eth.getAccounts().then((accounts) => {
    dispatch(accountsFetched(accounts))
    if (accounts[0]) {
      dispatch(setAccount(accounts[0]))
    }
  })
}

/**
 * This connects to the web3 service and listens to new blocks
 * @param {object} network
 * @param {function} _dispatch
 */
export const initWeb3Service = (network, _dispatch) => {
  dispatch = _dispatch
  let provider
  if (network.protocol === 'ws') {
    provider = new Web3.providers.WebsocketProvider(network.url)
  } else if (network.protocol === 'http') {
    provider = new Web3.providers.HttpProvider(network.url)
  }
  web3 = new Web3(provider)

  web3.eth.net.getId().then((_networkId) => {
    networkId = _networkId
  })

  // TODO: listen to blocks and trigger events we may be interested in!
  // web3.eth.subscribe('newBlockHeaders', (error, result) => {
  //   if (error) {
  //     console.error('Error in block header subscription:')
  //     console.error(error)
  //   }
  // }).on('data', (blockHeader) => {
  //   // If block isn't pending, check block txs for interation with observed contracts.
  //   if (blockHeader.number !== null) {
  //     // Check block txs for our contract txs, if contract involved, sync contract.
  //     const blockNumber = blockHeader.number

  //     web3.eth.getBlock(blockNumber, true).then((block) => {
  //       const txs = block.transactions

  //       if (txs.length > 0) {
  //         // Loop through txs looking for contract address
  //         // for (var i = 0; i < txs.length; i++) {
  //         //   if (contractAddresses.indexOf(txs[i].from) !== -1 || contractAddresses.indexOf(txs[i].to) !== -1) {
  //         //     const index = contractAddresses.indexOf(txs[i].from) !== -1 ? contractAddresses.indexOf(txs[i].from) : contractAddresses.indexOf(txs[i].to)
  //         //     const contractAddress = contractAddresses[index]

  //         //     return this.store.dispatch({ type: 'CONTRACT_SYNCING', contract: this.contracts[contractAddress] })
  //         //   }
  //         // }
  //       }
  //     }).catch((error) => {
  //       console.error('Error in block fetching:')
  //       console.error(error)
  //     })
  //   }
  // })
}

/**
 * Creates a lock on behalf of the user `from`.
 * @param {PropTypes.lock} lock
 * @param {PropTypes.account} from
 */
export const createLock = (lock, from) => {
  const unlock = new web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[networkId].address)
  const tx = unlock.methods.createLock(...Object.values(lock))
  tx.send({
    gas: 89499 * 10,
    from,
  }).then(function (receipt) {
    // TODO: this will take a couple seconds on real blockchains... so we need to indicate that to the user!
    if (receipt.events.NewLock) {
      getLock(receipt.events.NewLock.returnValues.newLockAddress)
    } else {
      // WAT?
    }
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
 * @param {PropTypes.string} data // This needs to maybe be less strict. (binary data)
 */
export const purchaseKey = (lockAddress, account, keyPrice, data) => {
  const lock = new web3.eth.Contract(LockContract.abi, lockAddress)
  const tx = lock.methods.purchase(data)
  tx.send({
    gas: 89499 * 10, // how much gas?
    from: account,
    value: keyPrice,
  }).then(function (receipt) {
    // TODO: this will take a couple seconds on real blockchains... so we need to indicate that to the user!
    if (receipt.events.SoldKey) {
      getKey(lockAddress, account)
    } else {
      // WAT?
    }
  })
}

/**
 * Returns the key to the lockAddress by the account.
 * @param {PropTypes.adress} lockAddress
 * @param {PropTypes.account} account
 */
export const getKey = (lockAddress, account) => {
  const lockContract = new web3.eth.Contract(LockContract.abi, lockAddress)
  const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(account).call()
  const getKeyDataPromise = lockContract.methods.keyDataFor(account).call()
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