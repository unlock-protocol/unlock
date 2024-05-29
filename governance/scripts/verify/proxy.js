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
const {
  getUnlock,
  getNetwork,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')

const parseCreationTx = async (hash) => {
  const { data } = await ethers.provider.getTransaction(hash)
  const unlock = await getUnlock()
  const [calldata, publicLockVersion] = unlock.interface.decodeFunctionData(
    'createUpgradeableLockAtVersion(bytes,uint16)',
    data
  )

  const publicLockAddress = await unlock.publicLockImpls(publicLockVersion)
  const proxyAdminAddress = await unlock.proxyAdminAddress()

  return [publicLockAddress, proxyAdminAddress, calldata]
}

async function main({ lockAddress, unlockAddress, creationTx, deployNew }) {
  let args

    // get Unlock contract
  ;({ unlockAddress } = await getNetwork())

  // check params
  if (deployNew && lockAddress) {
    throw Error('Cannot have both `lockAddress` and `deployNew` set')
  }
  if (lockAddress && !creationTx) {
    throw Error('Please pass the --creation-tx arg')
  }

  // deploy a new lock if no lock address
  if (deployNew) {
    const createLock = require('../lock/create')
    const { newLockAddress, hash } = await createLock()
    lockAddress = newLockAddress
    args = await parseCreationTx(hash)
  }

  // parse tx
  if (creationTx) {
    args = await parseCreationTx(creationTx)
  }

  console.table({
    unlockAddress,
    ...args,
  })

  // fetch correct proxy
  const unlock = await getUnlock(unlockAddress)
  const unlockVersion = await unlock.unlockVersion()
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'Unlock', version: unlockVersion },
  ])

  // get transprent proxy path from unlock impl
  const proxyPath = `${qualifiedPath.split(':')[0]}:TransparentUpgradeableProxy`
  console.log(proxyPath)

  // if (!transparentProxyAddress) {
  //   const TransparentProxy = await ethers.getContractFactory(
  //     '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy'
  //   )
  //   const transparentProxy = await TransparentProxy.deploy(
  //     publicLockAddress,
  //     proxyAdminAddress,
  //     calldata
  //   )
  //   console.log(
  //     `TransparentUpgradeableProxy > deployed to : ${transparentProxy.address} (tx: ${transparentProxy.deployTransaction.hash})`,
  //     '\n waiting for 10 blocks to confirm the tx...'
  //   )

  //   // wait for 10 confirmations
  //   await transparentProxy.deployTransaction.wait(10)
  //   transparentProxyAddress = transparentProxy.address
  // } else {
  //   console.log(
  //     `TransparentUpgradeableProxy already deployed to : ${transparentProxyAddress}`
  //   )
  // }

  await run('verify:verify', {
    address: lockAddress,
    contract: proxyPath,
    constructorArguments: args,
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
