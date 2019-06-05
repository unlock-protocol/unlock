const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

let publicLock = {
  expirationDuration: new BigNumber(60 * 60 * 24 * 30), // 30 days
  expirationTimestamp: new BigNumber(0), // Not used
  keyPriceCalculator: null, //
  keyPrice: new BigNumber(Units.convert(0.01, 'eth', 'wei')), // in wei
  maxNumberOfKeys: new BigNumber(10),
  lockName: 'Unlock-Protocol Lock',
}

module.exports = {
  FIRST: Object.assign({}, publicLock, {}),
  SECOND: Object.assign({}, publicLock, {}),
  'SINGLE KEY': Object.assign({}, publicLock, {
    maxNumberOfKeys: new BigNumber(1),
  }),
  OWNED: Object.assign({}, publicLock, {}),
  NAMED: Object.assign({}, publicLock, {
    lockName: 'Custom Named Lock',
  }),
  FREE: Object.assign({}, publicLock, {
    keyPrice: new BigNumber(0),
  }),
  SHORT: Object.assign({}, publicLock, {
    expirationDuration: new BigNumber(5), // 5 seconds
  }),
}
