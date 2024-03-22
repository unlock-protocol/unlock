/* eslint-disable global-require */
const { ethers, run, upgrades, network } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const createLock = require('../lock/create')
const {
  getUnlock,
  ADDRESS_ZERO,
  getNetwork,
} = require('@unlock-protocol/hardhat-helpers')

const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNLOCK DEPLOYMENT >', ...message)
}

// TODO: prompt user for each action before doing them and ask them for input?
async function main({
  unlockAddress,
  unlockVersion,
  publicLockVersion,
  udtAddress,
  publicLockAddress,
  wethAddress,
  oracleAddress,
  estimatedGasForPurchase,
  locksmithURI,
  owner,
}) {
  let udt
  const [deployer, minter] = await ethers.getSigners()

  // fetch chain info
  const { id: chainId, name: networkName, multisig } = await getNetwork()
  const isLocalNet = networkName === 'localhost'
  log(
    `Deploying contracts on ${networkName} with the account: ${deployer.address}`
  )

  log(`isLocalNet : ${isLocalNet}`)
  if (!unlockAddress) {
    // deploying Unlock with a transparent / upgradable proxy
    unlockAddress = await run('deploy:unlock', { unlockVersion })
  }

  // deploying PublicLock
  if (!publicLockAddress) {
    publicLockAddress = await run('deploy:template', { publicLockVersion })
  }

  // set lock template
  await run('set:template', {
    publicLockAddress,
    unlockAddress,
    unlockVersion,
  })

  // deploy UDT
  if (!udtAddress && isLocalNet) {
    // shutdown UDT on local for now
    // udtAddress = await run('deploy:udt')
  }

  if (!udtAddress) {
    udtAddress = ADDRESS_ZERO
  }

  // If UDT is not set for this network, let's not worry about it
  if (udtAddress !== ADDRESS_ZERO) {
    // pre-mint some UDTs, then delegate mint caps to contract
    if (isLocalNet) {
      const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
      udt = UDT.attach(udtAddress)

      const premintAmount = '1000000.0'
      udt = udt.connect(minter)
      await udt.mint(deployer.address, ethers.parseEther())
      log(`Pre-minted ${premintAmount} UDT to deployer`)

      await udt.addMinter(unlockAddress)
      log('grant minting permissions to the Unlock Contract')

      await udt.renounceMinter()
      log('minter renounced minter role')
    }

    // deploy WETH
    if (!wethAddress && isLocalNet) {
      wethAddress = await run('deploy:weth')
      log(`WETH deployed to : ${wethAddress}`)
    }
  }

  // config unlock
  await run('set:unlock-config', {
    unlockAddress,
    udtAddress,
    wethAddress: wethAddress || ADDRESS_ZERO,
    estimatedGasForPurchase,
    locksmithURI,
    isLocalNet,
  })

  if (udtAddress !== ADDRESS_ZERO && oracleAddress) {
    // Add Oracle for UDT (note: Oracle is also used to compute GDP of non-native-currency locks)
    await run('set:unlock-oracle', {
      unlockAddress,
      udtAddress,
      oracleAddress,
    })
  }

  // Transfer ownership of Unlock + Proxy admin
  if (!owner && multisig) {
    owner = multisig
    if (owner) {
      const unlock = await getUnlock(unlockAddress)
      await unlock.transferOwnership(owner)
      console.log(`> Transfered ownership of KeyManager to owner ${owner}`)

      // Transfer ownership of proxyadmin!
      const proxyAdmin = await upgrades.admin.getInstance()
      const proxyAdminOwner = await proxyAdmin.owner()
      if (proxyAdminOwner === deployer.address) {
        console.log(
          `> Proxy admin is owned by deployer, transfering to owner ${owner}`
        )
        await upgrades.admin.transferProxyAdminOwnership(owner)
        console.log(`> Transfered proxy admin ownership to ${owner}`)
      } else if (proxyAdminOwner === owner) {
        console.log(`> Proxy admin is already owned by ${owner}`)
      } else {
        console.log(
          `⚠️ Proxy admin is owned by ${proxyAdminOwner}! Can't transfer to ${owner}!`
        )
      }
    }
  }

  // Test by deploying a lock
  await createLock({
    unlockAddress,
    price: 0,
    duration: 60 * 60 * 24 * 30,
    maxNumberOfKeys: 100,
    name: 'Test Lock',
  })

  return {
    unlockAddress,
    publicLockAddress,
  }
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
