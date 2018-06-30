const Unlock = artifacts.require('./Unlock.sol')

module.exports = function deployContracts (deployer, network, accounts) {
  return deployer.deploy(Unlock, accounts[0])
}
