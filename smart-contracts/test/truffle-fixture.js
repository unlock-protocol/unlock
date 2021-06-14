const { deployments } = require('hardhat')

module.exports = async () => {
  await deployments.fixture()
}
