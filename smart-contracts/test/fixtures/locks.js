const BigNumber = require('bignumber.js')
const { MAX_UINT } = require('../helpers/constants')

let publicLock = {
  expirationDuration: new BigNumber(60 * 60 * 24 * 30), // 30 days
  expirationTimestamp: new BigNumber(0), // Not used
  keyPriceCalculator: null, //
  keyPrice: new BigNumber(web3.utils.toWei('0.01', 'ether')), // in wei
  maxNumberOfKeys: new BigNumber(10),
  lockName: 'Unlock-Protocol Lock',
}

module.exports = {
  FIRST: { ...publicLock },
  SECOND: { ...publicLock },
  'SINGLE KEY': {
    ...publicLock,
    maxNumberOfKeys: new BigNumber(1),
  },
  OWNED: { ...publicLock },
  NAMED: { ...publicLock, lockName: 'Custom Named Lock' },
  FREE: { ...publicLock, keyPrice: new BigNumber(0) },
  SHORT: {
    ...publicLock,
    expirationDuration: new BigNumber(5), // 5 seconds
  },
  ERC20: {
    ...publicLock,
    isErc20: true, // indicates the test should deploy a test token
  },
  NON_EXPIRING: {
    ...publicLock,
    expirationDuration: new BigNumber(MAX_UINT), // indicates that the lock should not expired
  },
}
