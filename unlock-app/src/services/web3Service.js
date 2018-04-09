import Web3 from 'web3'
import LockContract from '../artifacts/contracts/Lock.json'
import UnlockContract from '../artifacts/contracts/Unlock.json'

import { accountsFetched, setAccount } from '../actions/accounts'
import { newLock, setLock, resetLock, setKey } from '../actions/lock'

// web3 instance is shared
const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545')
const web3 = new Web3(provider)
let networkId, dispatch

export const initWeb3Service = (_dispatch) => {
  dispatch = _dispatch
  web3.eth.getAccounts().then((accounts) => {
    dispatch(accountsFetched(accounts))
    dispatch(setAccount(accounts[0]))
  })

  web3.eth.net.getId().then((_networkId) => {
    networkId = _networkId
  })

  // TODO: listen to blocks and trigger events we may be interested in!
  web3.eth.subscribe('newBlockHeaders', (error, result) => {
    if (error) {
      console.error('Error in block header subscription:')
      console.error(error)
    }
  }).on('data', (blockHeader) => {
    // If block isn't pending, check block txs for interation with observed contracts.
    if (blockHeader.number !== null) {
      // Check block txs for our contract txs, if contract involved, sync contract.
      const blockNumber = blockHeader.number

      web3.eth.getBlock(blockNumber, true).then((block) => {
        const txs = block.transactions

        if (txs.length > 0) {
          // Loop through txs looking for contract address
          // for (var i = 0; i < txs.length; i++) {
          //   if (contractAddresses.indexOf(txs[i].from) !== -1 || contractAddresses.indexOf(txs[i].to) !== -1) {
          //     const index = contractAddresses.indexOf(txs[i].from) !== -1 ? contractAddresses.indexOf(txs[i].from) : contractAddresses.indexOf(txs[i].to)
          //     const contractAddress = contractAddresses[index]

          //     return this.store.dispatch({ type: 'CONTRACT_SYNCING', contract: this.contracts[contractAddress] })
          //   }
          // }
        }
      }).catch((error) => {
        console.error('Error in block fetching:')
        console.error(error)
      })
    }
  })
}

export const createLock = (lock, from) => {
  const unlock = new web3.eth.Contract(UnlockContract.abi, UnlockContract.networks[networkId].address)
  const tx = unlock.methods.createLock(...Object.values(lock))
  tx.send({
    gas: 89499 * 10,
    from
  }).then(function (receipt) {
    // TODO: this will take a couple seconds on real blockchains... so we need to indicate that to the user!
    if (receipt.events.NewLock) {
      dispatch(newLock(receipt.events.NewLock.returnValues.newLockAddress))
    } else {
      // WAT?
    }
  })
}

export const getLock = (address) => {
  let lock = {
    address,
    memo: {} // This includes a memo
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
            // set the memo
            lock.memo[item.name][args] = result
            dispatch(resetLock(lock))
          })
          return undefined // By default we return undefined?
        }
      }
    }
  })

  dispatch(setLock(lock))
  // TODO: methods, events, changes?
  return lock
}

export const purchaseKey = (lockAddress, account, keyPrice, data) => {
  const lock = new web3.eth.Contract(LockContract.abi, lockAddress)
  const tx = lock.methods.purchase(data)
  tx.send({
    gas: 89499 * 10, // how much gas?
    from: account,
    value: keyPrice
  }).then(function (receipt) {
    // TODO: this will take a couple seconds on real blockchains... so we need to indicate that to the user!
    if (receipt.events.SoldKey) {
      getKey(lockAddress, account)
    } else {
      // WAT?
    }
  })
}

export const getKey = (lockAddress, currentAccount) => {
  const lockContract = new web3.eth.Contract(LockContract.abi, lockAddress)
  const getKeyExpirationPromise = lockContract.methods.keyExpirationTimestampFor(currentAccount).call()
  const getKeyDataPromise = lockContract.methods.keyDataFor(currentAccount).call()
  Promise.all([getKeyExpirationPromise, getKeyDataPromise])
    .then(([expiration, data]) => {
      dispatch(setKey({
        expiration: parseInt(expiration, 10),
        data
      }))
    })
}
