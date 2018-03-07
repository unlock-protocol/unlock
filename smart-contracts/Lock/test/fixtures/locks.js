const Units = require('ethereumjs-units')

module.exports = [
  {
    lockId:
      '0x7075626c69630000000000000000000000000000000000000000000000000000',
    keyReleaseMechanism: 0, // KeyReleaseMechanisms.Public
    expirationDuration: 60 * 60 * 24 * 30, // 30 days
    expirationTimestamp: 0, // Not used
    keyPriceCalculator: null, //
    keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
    maxNumberOfKeys: 10
  }
]
