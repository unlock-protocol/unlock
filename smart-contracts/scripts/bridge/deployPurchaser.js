const { ethers, run } = require('hardhat')

// https://docs.connext.network/resources/deployments
const connext = {
  5: '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649', // goerli
  80001: '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a', //mumbai
}

const weth = {
  5: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  80001: '0xFD2AB41e083c75085807c4A65C0A14FDD93d55A9',
}

async function main({
  bridgeAddress,
  wethAddress,
} = {}) {
  const { chainId } = await ethers.provider.getNetwork()
  
  bridgeAddress = connext[chainId]
  wethAddress = weth[chainId]

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
