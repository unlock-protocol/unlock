const { ethers, network } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getProxyAdminAddress } = require('../../helpers/deployments')

async function main({ unlockAddress }) {
  const { chainId } = await ethers.provider.getNetwork()

  if (!unlockAddress) {
    ;({ unlockAddress } = networks[chainId])
  }

  const { name } = networks[chainId]
  const unlock = await ethers.getContractAt('Unlock', unlockAddress)
  const proxyAdminAddress = await getProxyAdminAddress({ network })

  // eslint-disable-next-line no-console
  console.log(
    `Unlock deployed on ${name} \n`,
    `-  address: ${unlockAddress} \n`,
    `-  version: ${await unlock.unlockVersion()} \n`,
    `-  owner: ${await unlock.owner()} \n`
    `-  proxyAdminAddress: ${proxyAdminAddress} \n`
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
