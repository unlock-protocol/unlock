const { ethers, upgrades, artifacts } = require('hardhat')
const { copySync } = require('fs-extra')
const { addDeployment } = require('../../helpers/deployments')

const UnlockTruffle = artifacts.require('Unlock')

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
  const Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')

  const unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // 2. deploying PublicLock
  const PublicLock = await ethers.getContractFactory(
    'contracts/PublicLock.sol:PublicLock'
  )
  const publicLock = await PublicLock.deploy()

  // 3. setting lock template
  const version = await publicLock.publicLockVersion()
  await unlock.connect(unlockOwner).addLockTemplate(publicLock.address, version)
  await unlock.connect(unlockOwner).setLockTemplate(publicLock.address)

  // 5. deploy UDT (v3)
  const UDTv3 = await ethers.getContractFactory('UnlockDiscountTokenV3')
  const udt = await upgrades.deployProxy(UDTv3, [minter.address], {
    initializer: 'initialize(address)',
  })
  await udt.deployed()

  await addDeployment('UnlockDiscountTokenV3', udt, true)

  // 5. deploy Gov
  const Governor = await ethers.getContractFactory('UnlockProtocolGovernor')
  const gov = await Governor.deploy()
  await gov.deployed()

  await addDeployment('UnlockProtocolGovernor', gov, true)

  return {
    unlock: await UnlockTruffle.at(unlock.address),
    unlockEthers: unlock,
    publicLock,
    udt,
    gov,
  }
}
