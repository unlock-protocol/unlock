const { ethers, upgrades } = require('hardhat')

const { getNetworkName } = require('../helpers/network')
const { addDeployment } = require('../helpers/deployments')

async function main() {
  const [unlockOwner] = await ethers.getSigners()

  // fetch chain info
  const chainId = await unlockOwner.getChainId()
  const networkName = getNetworkName(chainId)

  // eslint-disable-next-line no-console
  console.log(
    `Deploying Unlock Governor on ${networkName} with the account: ${unlockOwner.address}`
  )

  // 1. deploying Unlock with a proxy
  const Unlock = await ethers.getContractFactory('UnlockGovernor')

  const unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // eslint-disable-next-line no-console
  console.log('Unlock proxy deployed to:', unlock.address)

  // save deployment info
  const unlockDeployment = await addDeployment('Unlock Governor', unlock, true)
  // eslint-disable-next-line no-console
  console.log(`Deployment info for ${unlockDeployment.contractName} saved.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
