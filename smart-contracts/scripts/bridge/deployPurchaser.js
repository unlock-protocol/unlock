const { ethers, run } = require('hardhat')
const addresses = require('./_addresses')

async function main({
  bridgeAddress,
  wethAddress,
} = {}) {
  const { chainId } = await ethers.provider.getNetwork()
  
  ;({bridgeAddress, wethAddress} = addresses[chainId])

  console.log(`CROSS_CHAIN > deploying on ${chainId} with (${bridgeAddress}, ${wethAddress})...`)

  const UnlockCrossChainPurchaser = await ethers.getContractFactory('UnlockCrossChainPurchaser')
  const purchaser = await UnlockCrossChainPurchaser.deploy(
    bridgeAddress,
    wethAddress
  )

  console.log(
    `CROSS_CHAIN > deployed to : ${purchaser.address}(tx: ${purchaser.deployTransaction.hash}`
  )

  await purchaser.wait(2)
  
  await run('verify:verify', {
    address: purchaser.address,
    constructorArguments: [bridgeAddress, wethAddress],
  })

  return purchaser.address
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
