const { ethers } = require('hardhat')
const {
  ADDRESS_ZERO,
  deployContract,
  copyAndBuildContractsAtVersion,
  LOCK_MANAGER_ROLE,
} = require('@unlock-protocol/hardhat-helpers')

async function main({ publicLockVersion }) {
  // fetch chain info
  const [signer] = await ethers.getSigners()

  if (!publicLockVersion) {
    throw Error('Need to set --public-lock-version')
  }

  console.log(
    `PUBLIC LOCK > Deploying lock template for released version ${publicLockVersion} with signer ${signer.address}`
  )

  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'PublicLock', version: publicLockVersion },
  ])

  const { contract: publicLock, address: publicLockAddress } =
    await deployContract(qualifiedPath)

  console.log(
    `PUBLIC LOCK > deployed v${await publicLock.publicLockVersion()} to : ${publicLockAddress}`
  )
  // initialize the template to prevent someone else from doing it
  const { hash: txInitHash } = await publicLock.initialize(
    signer.address,
    0,
    ADDRESS_ZERO,
    0,
    0,
    ''
  )
  console.log(`PUBLIC LOCK > Template initialized (tx: ${txInitHash})`)

  // renounce the manager role that was added during initilization
  const { hash: txRenounceHash } = await publicLock.revokeRole(
    LOCK_MANAGER_ROLE,
    await signer.getAddress()
  )
  console.log(`PUBLIC LOCK > manager role revoked (tx: ${txRenounceHash})`)

  return publicLockAddress
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
