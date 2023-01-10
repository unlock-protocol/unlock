

const { ethers, deployLock, upgrades } = require('hardhat')

export const setup = async (accounts) => {
  // Deploy a lock
  const lock = await deployLock({ from: accounts[0] })

  // Deploy upgradable KeyManager
  const KeyManager = await ethers.getContractFactory(
    'KeyManager'
  )

  const keyManager = await upgrades.deployProxy(KeyManager, [])
  await keyManager.deployed()

  return [keyManager, lock]
}