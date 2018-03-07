const Lock = artifacts.require('./Lock.sol')

module.exports = function deployContracts (deployer, network, accounts) {
  // Loading the contracts to deploy
  const LocksSettings = require(`../locks-settings/${network}.js`)(accounts)
  Promise.all(LocksSettings.map(
    ({
      beneficiary,
      unlockProtocol,
      keyReleaseMechanism,
      expirationDuration,
      expirationTimestamp,
      keyPriceCalculator,
      keyPrice,
      maxNumberOfKeys
    }) => {
      return deployer.deploy(
        Lock,
        beneficiary,
        unlockProtocol,
        keyReleaseMechanism,
        expirationDuration,
        expirationTimestamp,
        keyPriceCalculator,
        keyPrice,
        maxNumberOfKeys
      )
    }
  ))
}
