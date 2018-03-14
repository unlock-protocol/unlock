const Units = require('ethereumjs-units')

let defaultLock = {
  keyReleaseMechanism: 0, // KeyReleaseMechanisms.Public
  expirationDuration: 60 * 60 * 24 * 30, // 30 days
  expirationTimestamp: 0, // Not used
  keyPriceCalculator: null, //
  keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
  maxNumberOfKeys: 10
}

module.exports = {
  'FIRST': Object.assign({}, defaultLock, {}),
  'PRIVATE': Object.assign({}, defaultLock, {
    keyReleaseMechanism: 2 // KeyReleaseMechanisms.Private
  }),
  'SINGLE KEY': Object.assign({}, defaultLock, {
    maxNumberOfKeys: 1
  })
}
