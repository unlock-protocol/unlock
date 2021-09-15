const { constants } = require('hardlydifficult-ethereum-contracts')
const { ethers, upgrades } = require('hardhat')

const { getNetworkName } = require('../helpers/network')
const { addDeployment } = require('../helpers/deployments')

const { AddressZero } = ethers.constants

// TODO: params
const premintAmount = 20000
const estimatedGasForPurchase = 0
const wethAddress = AddressZero
const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const locksmithPort = process.env.LOCKSMITH_PORT || 3000
let udtAddress = null

// helpers
const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNLOCK SETUP >', ...message)
}

const saveDeploymentInfo = async (contractName, data) => {
  await addDeployment(contractName, data, true)
}

async function main() {
  const [unlockOwner, minter, holder] = await ethers.getSigners()

  // fetch chain info
  const chainId = await unlockOwner.getChainId()
  const networkName = getNetworkName(chainId)
  const isLocalNet = networkName === 'localhost'
  log(
    `Deploying contracts on ${networkName} with the account: ${unlockOwner.address}`
  )
  log(`isLocalNet : ${isLocalNet}`)
  log(`Deployment info saved to ./deployments/${networkName}.`)

  // 1. deploying Unlock with a transparent / upgradable proxy
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()
  await saveDeploymentInfo('Unlock', unlock)
  log('Unlock proxy deployed to:', unlock.address)

  // 2. deploying PublicLock
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()
  await saveDeploymentInfo('PublicLock', publicLock)
  log('PublicLock deployed at', publicLock.address)

  // 3. setting lock template
  unlock.setLockTemplate(publicLock.address, {
    from: unlockOwner.address,
    gasLimit: constants.MAX_GAS,
  })
  log('Template set for newly deployed lock')

  // 4. setup UDT if needed
  if (!udtAddress) {
    // deploy UDT v2 (upgradable)
    const UDT = await ethers.getContractFactory('UnlockDiscountTokenV2')
    let udt = await upgrades.deployProxy(UDT, [minter.address], {
      initializer: 'initialize(address)',
    })
    await udt.deployed()
    await saveDeploymentInfo('UnlockDiscountToken', udt)
    log('UDT (v2) deployed to:', udt.address)

    // pre-mint some UDTs, then delegate mint caps to contract
    udt = udt.connect(minter)
    await udt.mint(holder.address, premintAmount)
    log(`Pre-minted ${premintAmount} UDT`)

    await udt.addMinter(unlock.address)
    log('grant minting permissions to the Unlock Contract')

    await udt.renounceMinter()
    log('minter renounced minter role')

    udtAddress = udt.address
  }

  // 5. Config unlock
  unlock.configUnlock(
    udtAddress,
    wethAddress,
    estimatedGasForPurchase,
    'UDT',
    `http://${locksmithHost}:${locksmithPort}/api/key/`,
    chainId
  )
  log('unlock configured properly')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
