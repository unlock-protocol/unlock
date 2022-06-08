const fs = require('fs-extra')
const { ethers, run } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')
const { getNetworkName } = require('../../helpers/network')
const contracts = require('@unlock-protocol/contracts')

async function main({ publicLockVersion = 10 }) {
  // fetch chain info
  const { chainId } = await ethers.provider.getNetwork()
  const networkName = getNetworkName(chainId)
  const isLocalNet = networkName === 'localhost'

  let PublicLock
  if (publicLockVersion < 11) {
    const { abi, bytecode } = contracts[`PublicLockV${publicLockVersion}`]
    PublicLock = await ethers.getContractFactory(abi, bytecode)
  } else {
    PublicLock = await ethers.getContractFactory('PublicLock')
  }

  const publicLock = await PublicLock.deploy()
  await publicLock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `PUBLIC LOCK > deployed v${publicLockVersion} to : ${publicLock.address} (tx: ${publicLock.deployTransaction.hash})`
  )

  // verify
  if (!isLocalNet) {
    await run(`yarn hardhat verify`, { address: publicLock.address })
  }

  // save deployment info
  await addDeployment('PublicLock', publicLock, false)

  return publicLock.address
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
