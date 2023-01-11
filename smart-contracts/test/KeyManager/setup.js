

const { ethers, upgrades } = require('hardhat')
const {
  deployLock,
} = require('../helpers')


const setup = async (locksmith) => {
  // Deploy a lock
  const lock = await deployLock()

  // Deploy upgradable KeyManager
  const KeyManager = await ethers.getContractFactory(
    'KeyManager'
  )

  const keyManager = await upgrades.deployProxy(KeyManager, [locksmith])
  await keyManager.deployed()

  return [keyManager, lock]
}


module.exports = {
  setup
}