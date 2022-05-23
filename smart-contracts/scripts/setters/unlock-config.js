const { ethers } = require('hardhat')

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
  if (!wethAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNLOCK CONFIG > Missing WETH address... aborting. Please use --weth-address'
    )
  }
  if (!udtAddress) {
    // eslint-disable-next-line no-console
    throw new Error(
      'UNLOCK CONFIG > Missing UDT address... aborting. Please use --udt-address'
    )
  }

  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  let hostname = isLocalNet
    ? 'http://127.0.0.1:3000'
    : 'https://locksmith.unlock-protocol.com'

  // set lock config
  const tx = await unlock
    .connect(deployer)
    .configUnlock(
      udtAddress,
      wethAddress,
      estimatedGasForPurchase || 200000,
      'KEY',
      locksmithURI || `${hostname}/api/key/${chainId}/`,
      chainId
    )

  const { transactionHash } = await tx.wait()

  // eslint-disable-next-line no-console
  console.log(
    `UNLOCK CONFIG > Unlock configured properly. (tx: ${transactionHash})`
  )
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
