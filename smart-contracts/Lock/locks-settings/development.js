const Units = require('ethereumjs-units')

module.exports = function (accounts) {
  return [
    {
      beneficiary: accounts[0],
      unlockProtocol: null,
      keyReleaseMechanism: 0, // KeyReleaseMechanisms.Public
      expirationDuration: 60 * 60 * 24 * 30, // 30 days
      expirationTimestamp: 0, // Not used
      keyPriceCalculator: null, //
      keyPrice: Units.convert(0.01, 'eth', 'wei'), // in wei
      maxNumberOfKeys: 10
    }
  ]
}
