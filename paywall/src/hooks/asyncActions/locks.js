import Web3Utils from 'web3-utils'
import { MAX_UINT, UNLIMITED_KEYS_COUNT } from '../../constants'

export const attributes = {
  keyPrice: x => Web3Utils.fromWei(x, 'ether'),
  expirationDuration: parseInt,
  maxNumberOfKeys: value => {
    if (value === MAX_UINT) {
      return UNLIMITED_KEYS_COUNT
    }
    return parseInt(value)
  },
  owner: x => x,
  outstandingKeys: parseInt,
}

export function makeGetLockAttributes({ web3, lockAddress, setLock }) {
  const getLockAttributes = async contract => {
    const constantPromises = Object.keys(attributes).map(async attribute => {
      const result = await contract.methods[attribute]().call()
      return attributes[attribute](result) // We cast the value
    })

    // Let's load its balance
    const getBalance = async () => {
      const balance = await web3.eth.getBalance(lockAddress)
      return Web3Utils.fromWei(balance, 'ether')
    }
    constantPromises.push(getBalance())

    // Let's load the current block to use to compare versions
    constantPromises.push(web3.eth.getBlockNumber())

    // Once all lock attributes have been fetched
    const [
      keyPrice,
      expirationDuration,
      maxNumberOfKeys,
      owner,
      outstandingKeys,
      balance,
      asOf,
    ] = await Promise.all(constantPromises)
    const update = {
      address: lockAddress,
      keyPrice,
      expirationDuration,
      maxNumberOfKeys,
      unlimitedKeys: maxNumberOfKeys === UNLIMITED_KEYS_COUNT,
      owner,
      outstandingKeys,
      balance,
      asOf,
    }
    setLock(update)
  }

  return getLockAttributes
}
