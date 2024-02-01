const { ethers } = require('hardhat')
const {
  getUnlock,
  getNetwork,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')

async function main({
  unlockAddress,
  udtAddress,
  wethAddress,
  estimatedGasForPurchase,
  locksmithURI,
  isLocalNet,
}) {
  if (!unlockAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNLOCK CONFIG > Missing Unlock address... aborting. Please use --unlock-address'
    )
  }

  if (!udtAddress) {
    udtAddress = ADDRESS_ZERO
  }

  if (!wethAddress) {
    const {
      nativeCurrency: { wrapped },
    } = await getNetwork()
    wethAddress = wrapped || ADDRESS_ZERO
  }

  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  const unlock = await getUnlock(unlockAddress)

  let hostname = isLocalNet
    ? 'http://127.0.0.1:3000'
    : 'https://locksmith.unlock-protocol.com'

  if (!estimatedGasForPurchase) {
    estimatedGasForPurchase = 200000
  }

  const symbol = 'KEY'

  if (!locksmithURI) {
    locksmithURI = `${hostname}/api/key/${chainId}/`
  }

  // eslint-disable-next-line no-console
  console.log(`UNLOCK CONFIG > Configuring Unlock with the following:
      - udtAddress: ${udtAddress}
      - wethAddress: ${wethAddress}
      - estimatedGasForPurchase: ${estimatedGasForPurchase}
      - symbol: ${symbol}
      - locksmithURI: ${locksmithURI}
      - chainId: ${chainId}
  `)
  // set lock config
  const tx = await unlock
    .connect(deployer)
    .configUnlock(
      udtAddress,
      wethAddress,
      estimatedGasForPurchase,
      symbol,
      locksmithURI,
      chainId
    )

  const { hash } = await tx.wait()

  // eslint-disable-next-line no-console
  console.log(`UNLOCK CONFIG > Unlock configured properly. (tx: ${hash})`)
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
