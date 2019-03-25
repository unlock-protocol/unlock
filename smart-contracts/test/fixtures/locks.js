const Units = require('ethereumjs-units')
const BigNumber = require('bignumber.js')

let publicLock = {
  expirationDuration: new BigNumber(60 * 60 * 24 * 30), // 30 days
  expirationTimestamp: new BigNumber(0), // Not used
  keyPriceCalculator: null, //
  keyPrice: new BigNumber(Units.convert(0.01, 'eth', 'wei')), // in wei
  maxNumberOfKeys: new BigNumber(10),
}

module.exports = {
  FIRST: Object.assign({}, publicLock, {}),
  SECOND: Object.assign({}, publicLock, {}),
  'SINGLE KEY': Object.assign({}, publicLock, {
    maxNumberOfKeys: new BigNumber(1),
  }),
  OWNED: Object.assign({}, publicLock, {}),
}
