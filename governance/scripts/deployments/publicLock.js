const { ethers, run } = require('hardhat')
const { isLocalhost } = require('@unlock-protocol/hardhat-helpers')
const contracts = require('@unlock-protocol/contracts')

async function main({ publicLockVersion }) {
  // fetch chain info
  const [signer] = await ethers.getSigners()

  let PublicLock
  if (publicLockVersion) {
    const { abi, bytecode } = contracts[`PublicLockV${publicLockVersion}`]
    console.log(
      `PUBLIC LOCK > Deploying lock template for released version ${publicLockVersion} with signer ${signer.address}`
    )
    PublicLock = await ethers.getContractFactory(abi, bytecode)
  } else {
    throw Error('Need to set --public-lock-version')
  }

  const publicLock = await PublicLock.deploy()
  await publicLock.waitForDeployment()
  const { hash } = await publicLock.deploymentTransaction()
  const publicLockAddress = await publicLock.getAddress()

  // eslint-disable-next-line no-console
  console.log(
    `PUBLIC LOCK > deployed v${await publicLock.publicLockVersion()} to : ${publicLockAddress} (tx: ${hash})`
  )

  if (!isLocalhost()) {
    await run('verify:verify', { address: publicLockAddress })
  }

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
