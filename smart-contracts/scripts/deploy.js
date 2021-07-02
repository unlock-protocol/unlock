const { constants } = require('hardlydifficult-ethereum-contracts')
const { ethers, upgrades } = require('hardhat')

const { getNetworkName } = require('../helpers/network')
const { addDeployment } = require('../helpers/deployments')

async function main() {
  const [unlockOwner, minter] = await ethers.getSigners()
  
  // fetch chain info
  const chainId = await unlockOwner.getChainId()
  const networkName = getNetworkName(chainId)

  // eslint-disable-next-line no-console
  console.log(
    `Deploying contracts on ${networkName} with the account: ${unlockOwner.address}`
  )

  // 1. deploying Unlock with a proxy
  const Unlock = await ethers.getContractFactory('Unlock')

  const unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()

  // eslint-disable-next-line no-console
  console.log('Unlock proxy deployed to:', unlock.address)

  // save deployment info
  const unlockDeployment = await addDeployment('Unlock', unlock, true)
  // eslint-disable-next-line no-console
  console.log(`Deployment info for ${unlockDeployment.contractName} saved.`)

  // 2. deploying PublicLock
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()

  // eslint-disable-next-line no-console
  console.log('PublicLock deployed at', publicLock.address)

  // save deployment info
  const lockDeployment = await addDeployment('PublicLock', publicLock)

  // eslint-disable-next-line no-console
  console.log(`Deployment info for ${lockDeployment.contractName} saved.`)

  // 3. setting lock template
  unlock.setLockTemplate(publicLock.address, {
    from: unlockOwner.address,
    gasLimit: constants.MAX_GAS,
  })
  // eslint-disable-next-line no-console
  console.log('Template set for newly deployed lock')

  // 4. deploy UDT
  const UDT = await ethers.getContractFactory('UnlockDiscountToken')
  const token = await upgrades.deployProxy(UDT, [minter.address], {
    initializer: 'initialize(address)',
  })
  await token.deployed()
  // eslint-disable-next-line no-console
  console.log('UDT deployed to:', token.address)

  // save deployment info
  const UDTdeployment = await addDeployment('UnlockDiscountToken', token, true)
  // eslint-disable-next-line no-console
  console.log(`Deployment info for ${UDTdeployment.contractName} saved.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
