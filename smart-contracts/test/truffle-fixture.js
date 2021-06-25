const { constants } = require('hardlydifficult-ethereum-contracts')
const { ethers, upgrades } = require('hardhat')

const { addDeployment } = require('../helpers/deployments')

module.exports = async () => {
  // setup accounts
  const [unlockOwner, minter] = await ethers.getSigners()

  // 1. deploying Unlock with a proxy
  const Unlock = await ethers.getContractFactory('Unlock')

  const unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // save deployment info
  await addDeployment('Unlock', unlock, true)

  // 2. deploying PublicLock
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()

  // save deployment info
  await addDeployment('PublicLock', publicLock)

  // 3. setting lock template
  unlock.setLockTemplate(publicLock.address, {
    from: unlockOwner.address,
    gasLimit: constants.MAX_GAS,
  })

  // 4. deploy UDT
  const UDT = await ethers.getContractFactory('UnlockDiscountToken')
  const token = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await token.deployed()

  // save deployment info
  await addDeployment('UnlockDiscountToken', token, true)
}
