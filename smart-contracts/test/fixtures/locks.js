const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

const publicLock = {
  expirationDuration: new BigNumber(60 * 60 * 24 * 30), // 30 days
  expirationTimestamp: new BigNumber(0), // Not used
  keyPriceCalculator: null, //
  keyPrice: new BigNumber(Units.convert(0.01, 'eth', 'wei')), // in wei
  maxNumberOfKeys: new BigNumber(10),
  lockName: 'Unlock-Protocol Lock',
}

module.exports = {
  FIRST: { ...publicLock },
  SECOND: { ...publicLock },
  'SINGLE KEY': { ...publicLock, maxNumberOfKeys: new BigNumber(1) },
  OWNED: { ...publicLock },
  NAMED: { ...publicLock, lockName: 'Custom Named Lock' },
  FREE: { ...publicLock, keyPrice: new BigNumber(0) },
  SHORT: {
    ...publicLock,
    expirationDuration: new BigNumber(5), // 5 seconds
  },
}
