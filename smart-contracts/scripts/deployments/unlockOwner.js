const { ethers, run } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main({
  unlockAddress,
  daoTimelockAddress,
  multisig,
  dryRun,
} = {}) {
  const { chainId } = await ethers.provider.getNetwork()
  if (!unlockAddress) {
    ;({ unlockAddress } = await networks[chainId])
  }
  if (!multisig) {
    ;({ multisig } = await networks[chainId])
  }

  // get bridge info
  const {
    bridge: { domainId, connext: bridgeAddress },
  } = networks[chainId]

  console.log(`Deploying on network :${chainId}`)
  const args = {
    bridgeAddress,
    unlockAddress,
    daoTimelockAddress, // dao address on mainnet
    multisig, // multisig that controls
    domainId,
  }
  console.log(args)

  if (dryRun) return

  const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
  const unlockOwner = await UnlockOwner.deploy(...Object.values(args))
  await unlockOwner.deployed()

  console.log(
    `UnlockOwner > deployed to : ${unlockOwner.address} (tx: ${unlockOwner.deployTransaction.hash}`
  )

  if (chainId !== 31137) {
    await run('verify:verify', {
      address: unlockOwner.address,
      constructorArguments: Object.values(args),
    })
  }
  return unlockOwner.address
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
