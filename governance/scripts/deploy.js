const { ethers, run } = require('hardhat')

const abis = require('@unlock-protocol/contracts')
const {
  copyAndBuildContractsAtVersion,
  getUnlock,
  ADDRESS_ZERO,
  deployUpgradeableContract,
  LOCK_MANAGER_ROLE,
} = require('@unlock-protocol/hardhat-helpers')

const publicLockVersion = 15
const unlockVersion = 13

async function main() {
  const [signer] = await ethers.getSigners()
  const { abi, bytecode } = abis[`PublicLockV${publicLockVersion}`]
  const factory = await ethers.getContractFactory(abi, bytecode, signer)
  const publicLock = await factory.deploy()
  console.log(await publicLock.getAddress())

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(
    `${__dirname}/governance`,
    [{ contractName: 'Unlock', version: unlockVersion }]
  )

  // deploy proxy w impl
  const { address: unlockAddress } = await deployUpgradeableContract(
    qualifiedPath,
    [await signer.getAddress()],
    {
      initializer: 'initialize(address)',
    }
  )

  // await publicLock.initialize(unlockAddress, 0, ADDRESS_ZERO, 0, 0, '')
  console.log('init done')

  console.log(await publicLock.hasRole(LOCK_MANAGER_ROLE, unlockAddress))
  console.log(
    await publicLock.hasRole(LOCK_MANAGER_ROLE, await signer.getAddress())
  )
  // await publicLock.revokeRole(LOCK_MANAGER_ROLE, unlockAddress)

  const unlock = await getUnlock(unlockAddress)
  await unlock.addLockTemplate(await publicLock.getAddress(), publicLockVersion)
  await unlock.setLockTemplate(await publicLock.getAddress())
}
// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
