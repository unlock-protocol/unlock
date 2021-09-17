const { ethers } = require('hardhat')

async function main({
  unlockAddress,
  udtAddress,
  wethAddress,
  estimatedGasForPurchase,
  locksmithURI,
}) {
  if (!unlockAddress) {
    // eslint-disable-next-line no-console
    throw new Error('UNLOCK CONFIG > Missing Unlock address... aborting.')
  }
  if (!wethAddress) {
    // eslint-disable-next-line no-console
    throw new Error('UNLOCK CONFIG > Missing WETH address... aborting.')
  }
  if (!udtAddress) {
    // eslint-disable-next-line no-console
    throw new Error('UNLOCK CONFIG > Missing UDT address... aborting.')
  }

  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = Unlock.attach(unlockAddress)

  // set lock config
  unlock
    .connect(deployer)
    .configUnlock(
      udtAddress,
      wethAddress,
      estimatedGasForPurchase || 0,
      'UDT',
      locksmithURI || 'http://127.0.0.1:3000/api/key/',
      chainId
    )

  // eslint-disable-next-line no-console
  console.log('UNLOCK CONFIG > Unlock configured properly.')
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
