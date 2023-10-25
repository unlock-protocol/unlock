/**
 * Deploy and verify an empty TransparentProxy using the correct calldata
 * so locks will appears as verified on the blockexplorer network
 *
 * usage: run using hardhat task
 * ```
 * // export block explorer key
 * export XXX_KEY=<xxx>
 *
 * // launch verification process
 * yarn hardhat verify-proxy \
 *   --public-lock-address 0xa9584e6cbaf88c09e5ede06865211ba28febd077 \
 *   --proxy-admin-address 0xa9584e6cbaf88c09e5ede06865211ba28febd077 \
 *   --network optimism
 * ```
 *
 * If you have already deployed a proxy using that script, you can
 * pass `--transparent-proxy-address` to prevent proxy contract
 * from being deployed again
 *
 * NB: the deployment wait for 10 confirmations so deployed bytecode
 * can be picked up by the block explorer
 */
const { ethers, run } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const createLockCalldata = require('../test/helpers/createLockCalldata')
const Locks = require('../test/fixtures/locks')

async function main({
  calldata,
  unlockAddress,
  lockVersion,
  publicLockAddress,
  proxyAdminAddress,
  transparentProxyAddress,
}) {
  if (!calldata) {
    const name = 'FIRST'
    const args = [
      Locks[name].expirationDuration,
      ethers.constants.AddressZero,
      Locks[name].keyPrice,
      Locks[name].maxNumberOfKeys,
      Locks[name].lockName,
    ]
    calldata = await createLockCalldata({ args })
  }

  const { chainId } = await ethers.provider.getNetwork()
  if (transparentProxyAddress) {
    const lock = await ethers.getContractAt(
      'PublicLock',
      transparentProxyAddress
    )
    unlockAddress = await lock.unlockProtocol()
  } else {
    ;({ unlockAddress } = networks[chainId])
  }

  if (lockVersion) {
    const unlock = await ethers.getContractAt('Unlock', unlockAddress)
    publicLockAddress = await unlock.publicLockImpls(lockVersion)
  }

  if (!publicLockAddress) {
    const unlock = await ethers.getContractAt('Unlock', unlockAddress)
    publicLockAddress = await unlock.publicLockAddress()
  }

  if (!proxyAdminAddress) {
    const unlock = await ethers.getContractAt('Unlock', unlockAddress)
    proxyAdminAddress = await unlock.proxyAdminAddress()
  }

  console.table({
    chainId,
    unlockAddress,
    lockVersion,
    publicLockAddress,
    proxyAdminAddress,
    calldata,
  })

  if (!transparentProxyAddress) {
    const TransparentProxy = await ethers.getContractFactory(
      '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy'
    )
    const transparentProxy = await TransparentProxy.deploy(
      publicLockAddress,
      proxyAdminAddress,
      calldata
    )
    console.log(
      `TransparentUpgradeableProxy > deployed to : ${transparentProxy.address} (tx: ${transparentProxy.deployTransaction.hash})`,
      '\n waiting for 10 blocks to confirm the tx...'
    )

    // wait for 10 confirmations
    await transparentProxy.deployTransaction.wait(10)
    transparentProxyAddress = transparentProxy.address
  } else {
    console.log(
      `TransparentUpgradeableProxy already deployed to : ${transparentProxyAddress}`
    )
  }

  await run('verify:verify', {
    address: transparentProxyAddress,
    contract:
      '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy',
    constructorArguments: [publicLockAddress, proxyAdminAddress, calldata],
  })
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
