const { ethers, upgrades } = require('hardhat')
const { copySync } = require('fs-extra')

module.exports = async () => {
  // when running a mainnet fork
  if (process.env.RUN_FORK) {
    // copy .oppenzeppelin mainnet network manifest
    copySync('.openzeppelin/mainnet.json', '.openzeppelin/unknown-31337.json')
    // skip contracts setup
    return
  }

  // setup accounts
  const [unlockOwner, minter] = await ethers.getSigners()

  // 1 deploying Unlock with a proxy
  const Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')

  const unlock = await upgrades.deployProxy(
    Unlock,
    [await unlockOwner.getAddress()],
    {
      initializer: 'initialize(address)',
    }
  )

  // 2 deploying PublicLock
  const PublicLock = await ethers.getContractFactory(
    'contracts/PublicLock.sol:PublicLock'
  )
  const publicLock = await PublicLock.deploy()
  const publicLockAddress = await publicLock.getAddress()

  // 3 setting lock template
  const version = await publicLock.publicLockVersion()
  await unlock.connect(unlockOwner).addLockTemplate(publicLockAddress, version)
  await unlock.connect(unlockOwner).setLockTemplate(publicLockAddress)

  // 5 deploy UP ERC20 Governance Token
  const UPToken = await ethers.getContractFactory('UPToken')
  const up = await upgrades.deployProxy(UPToken, [await minter.getAddress()])

  return {
    unlock,
    publicLock,
    up,
    udt: up, // keeping UDT as exported variable for legacy
  }
}
