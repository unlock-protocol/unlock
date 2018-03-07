
const Lock = artifacts.require('./Lock.sol')
const Units = require('ethereumjs-units')

module.exports = function deployContracts (deployer, network, accounts) {
  // TODO: not hard code the values here...
  const beneficiary = accounts[0]
  const unlockProtocol = null
  const keyReleaseMechanism = 0 // KeyReleaseMechanisms.Public
  const expirationDuration = 60 * 60 * 24 * 30 // 30 days
  const expirationTimestamp = 0 // Not used
  const keyPriceCalculator = null //
  const keyPrice = Units.convert(0.01, 'eth', 'wei') // in wei
  const maxNumberOfKeys = 10
  deployer.deploy(Lock, beneficiary, unlockProtocol, keyReleaseMechanism, expirationDuration, expirationTimestamp, keyPriceCalculator, keyPrice, maxNumberOfKeys)
}
