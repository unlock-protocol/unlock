const { ethers } = require('hardhat')

const destChainId = 31337
const destDomainId = 1734439522

const deployPublicLockImpl = async () => {
  const PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')

  // deploy template
  const template = await PublicLock.deploy()
  const args = [template.address, 14]

  // parse call
  const { interface } = await ethers.getContractFactory('Unlock')
  const unlockCallData = interface.encodeFunctionData('addLockTemplate', args)
  const calldata = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'bytes'],
    [1, unlockCallData]
  )

  return {
    args,
    calldata,
    template,
  }
}

const deployUnlockImpl = async ({ unlockAddress }) => {
  const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
  const unlockUpgraded = await UnlockUpgraded.deploy()

  const { interface } = await ethers.getContractFactory('ProxyAdmin')
  const args = [unlockAddress, unlockUpgraded.address]
  const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
  const calldata = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'bytes'],
    [2, proxyAdminCalldata]
  )

  return {
    calldata,
    unlockUpgraded,
  }
}

module.exports = {
  deployPublicLockImpl,
  deployUnlockImpl,
  destChainId,
  destDomainId,
}
