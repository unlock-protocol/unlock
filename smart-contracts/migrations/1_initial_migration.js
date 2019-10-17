const Migrations = artifacts.require('./Migrations.sol')
const fs = require('fs')
const getNetworkFile = require('../helpers/ZosNetworkFile.js')

module.exports = function initialMigration(deployer) {
  // If the network is `--reset`, then also delete the ZOS configuration so that ZOS resets.
  // This prevents an error where ZOS attempts to use a proxy which does not exist any longer.
  return getNetworkFile(web3).then(networkFile => {
    fs.unlink(networkFile.filePath, () => {})

    return deployer.deploy(Migrations)
  })
}
