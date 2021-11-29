const { ethers, upgrades } = require('hardhat')
const { copySync } = require('fs-extra')
const { addDeployment } = require('../helpers/deployments')

module.exports = async () => {
  // when running a mainnet fork
  if (process.env.RUN_MAINNET_FORK) {
    // copy .oppenzeppelin mainnet network manifest
    copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
    // skip contracts setup
    return
  }

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
  const version = await publicLock.publicLockVersion()
  await unlock.connect(unlockOwner).addLockTemplate(publicLock.address, version)
  await unlock.connect(unlockOwner).setLockTemplate(publicLock.address)

  // 4. deploy UDT
  const UDT = await ethers.getContractFactory('UnlockDiscountToken')
  const token = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await token.deployed()

  // save deployment info
  await addDeployment('UnlockDiscountToken', token, true)

  // 5. deploy UDT (v3)
  const UDTv3 = await ethers.getContractFactory('UnlockDiscountTokenV3')
  const tokenv3 = await upgrades.deployProxy(UDTv3, [minter.address], {
    initializer: 'initialize(address)',
  })
  await tokenv3.deployed()

  // save deployment info
  await addDeployment('UnlockDiscountTokenV3', tokenv3, true)

  // 5. deploy Gov
  const Governor = await ethers.getContractFactory('UnlockProtocolGovernor')
  const gov = await Governor.deploy()
  await gov.deployed()

  // save deployment info
  await addDeployment('UnlockProtocolGovernor', gov, true)
}
