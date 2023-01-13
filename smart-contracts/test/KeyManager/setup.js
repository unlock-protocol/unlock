const { ethers, upgrades } = require('hardhat')
const {
  deployLock,
} = require('../helpers')


const setup = async () => {
  // Deploy a lock
  const lock = await deployLock()

  // Deploy upgradable KeyManager
  const KeyManager = await ethers.getContractFactory(
    'KeyManager'
  )

  const keyManager = await upgrades.deployProxy(KeyManager, [])
  await keyManager.deployed()

  return [keyManager, lock]
}

module.exports = {
  setup
}