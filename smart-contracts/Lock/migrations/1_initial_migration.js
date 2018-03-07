const Migrations = artifacts.require('./Migrations.sol')

module.exports = function initialMigration (deployer) {
  deployer.deploy(Migrations)
}
