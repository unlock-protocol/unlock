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
  FIRST: Object.assign({}, publicLock, {}),
  SECOND: Object.assign({}, publicLock, {}),
  'SINGLE KEY': Object.assign({}, publicLock, {
    maxNumberOfKeys: 1,
  }),
  OWNED: Object.assign({}, publicLock, {}),
  NAMED: Object.assign({}, publicLock, {
    lockName: 'Custom Named Lock',
  }),
  FREE: Object.assign({}, publicLock, {
    keyPrice: 0,
  }),
  SHORT: Object.assign({}, publicLock, {
    expirationDuration: 5, // 5 seconds
  }),
  ERC20: Object.assign({}, publicLock, {
    isErc20: true, // indicates the test should deploy a test token
  }),
  NON_EXPIRING: Object.assign({}, publicLock, {
    expirationDuration: MAX_UINT, // indicates that the lock should not expired
  }),
}
