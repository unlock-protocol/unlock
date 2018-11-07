const Units = require('ethereumjs-units')

let publicLock = {
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  expirationTimestamp: 0, // Not used
  keyPriceCalculator: null, //
  keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
  maxNumberOfKeys: 10
}

module.exports = {
  'FIRST': Object.assign({}, publicLock, {}),
  'SECOND': Object.assign({}, publicLock, {}),
  'SINGLE KEY': Object.assign({}, publicLock, {
    maxNumberOfKeys: 1
  }),
  'OWNED': Object.assign({}, publicLock, {})

}
