const { ethers, run } = require('hardhat')
const { networks } = require('@unlock-protocol/networks') 
const bridgeInfo = require('../../helpers/bridge')

async function main({
  unlockAddress,
  daoTimelockAddress,
  multisig,
  dryRun,
  mainnetChainId = 5,
} = {}) {

  const { chainId } = await ethers.provider.getNetwork()
  if (!unlockAddress) {
    ;({ unlockAddress } = await networks[chainId])
  }
  if (!multisig) {
    ;({ multisig } = await networks[chainId])
  }
  
  const { domainId, bridgeAddress } = bridgeInfo[chainId]

  console.log(`Deploying on network :${chainId}`)
  const args = {
    bridgeAddress,
    unlockAddress,
    daoTimelockAddress, // dao address on mainnet
    multisig, // multisig that controls
    domainId,
    mainnetChainId,
  }
  console.log(args)

  if(dryRun) return 

  const UnlockOwner = await ethers.getContractFactory('UnlockOwner')
  const unlockOwner = await UnlockOwner.deploy(...Object.values(args))
  await unlockOwner.deployed()

  console.log(
    `UnlockOwner > deployed to : ${unlockOwner.address} (tx: ${unlockOwner.deployTransaction.hash}`
  )

  if(chainId !== 31137) {
    await run('verify:verify', {
      address: '0xa55F8Ba16C5Bb580967f7dD94f927B21d0acF86c', //unlockOwner.address,
      constructorArguments: Object.values(args)
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
