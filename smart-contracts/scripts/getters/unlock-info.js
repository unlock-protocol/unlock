const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main({ unlockAddress }) {
  const { chainId } = await ethers.provider.getNetwork()

  if (!unlockAddress) {
    ;({ unlockAddress } = networks[chainId])
  }

  const { name } = networks[chainId]
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)

  // eslint-disable-next-line no-console
  console.log(
    `Unlock deployed on ${name} \n`,
    `-  address: ${unlockAddress} \n`,
    `-  owner: ${await unlock.owner()} \n`
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
