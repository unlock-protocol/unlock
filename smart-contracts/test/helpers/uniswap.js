const { ethers } = require('hardhat')

const createMockOracle = async ({ rates = [], fee = 500 }) => {
  // Deploy mock oracle
  const MockOracle = await ethers.getContractFactory('MockOracle')
  const oracle = MockOracle.deploy(fee, rates)

  return oracle
}

module.exports = {
  createMockOracle,
}
