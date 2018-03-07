const Units = require('ethereumjs-units')

// Note web3: the current version of web3 injected by Truffle is
// old. web3.fromAscii will fail when this is updated
module.exports = [
  {
    lockId: web3.fromAscii('FIRST LOCK'),
    keyReleaseMechanism: 0, // KeyReleaseMechanisms.Public
    expirationDuration: 60 * 60 * 24 * 30, // 30 days
    expirationTimestamp: 0, // Not used
    keyPriceCalculator: null, //
    keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
    maxNumberOfKeys: 10
  },
  {
    lockId: web3.fromAscii('PRIVATE LOCK'),
    keyReleaseMechanism: 0, // KeyReleaseMechanisms.Public
    expirationDuration: 60 * 60 * 24 * 30, // 30 days
    expirationTimestamp: 0, // Not used
    keyPriceCalculator: null, //
    keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
    maxNumberOfKeys: 10
  }
]
