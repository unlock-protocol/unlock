const { ethers } = require('hardhat')
const { MAX_UINT } = require('../helpers/constants')

let publicLock = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  expirationTimestamp: 0, // Not used
  keyPriceCalculator: null,
  keyPrice: ethers.utils.parseUnits('0.01', 'ether'),
  maxNumberOfKeys: 10,
  lockName: 'Unlock-Protocol Lock',
}

module.exports = {
  FIRST: { ...publicLock },
  SECOND: { ...publicLock },
  'SINGLE KEY': {
    ...publicLock,
    maxNumberOfKeys: 1,
  },
  OWNED: { ...publicLock },
  NAMED: { ...publicLock, lockName: 'Custom Named Lock' },
  FREE: { ...publicLock, keyPrice: 0 },
  SHORT: {
    ...publicLock,
    expirationDuration: 5, // 5 seconds
  },
  ERC20: {
    ...publicLock,
    isErc20: true, // indicates the test should deploy a test token
  },
  NON_EXPIRING: {
    ...publicLock,
    expirationDuration: MAX_UINT, // indicates that the lock should not expired
  },
}
