const { ethers, run } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')
const { getNetworkName } = require('../../helpers/network')
const contracts = require('@unlock-protocol/contracts')

function parse(data) {
  return ethers.utils.parseUnits(Math.ceil(data) + '', 'gwei')
}

async function main({ publicLockVersion }) {
  // fetch chain info
  const { chainId } = await ethers.provider.getNetwork()
  const networkName = getNetworkName(chainId)
  const isLocalNet = networkName === 'localhost'

  const [signer] = await ethers.getSigners()
  console.log(signer.address)

  let PublicLock
  if (publicLockVersion) {
    const { abi, bytecode } = contracts[`PublicLockV${publicLockVersion}`]
    PublicLock = await ethers.getContractFactory(abi, bytecode)
  } else {
    PublicLock = await ethers.getContractFactory('PublicLock')
  }

  // fix MATIC gas too low
  const resp = await fetch('https://gasstation-mainnet.matic.network/v2')
  const data = await resp.json()
  const maxFeePerGas = parse(data.fast.maxFee).mul(2)
  const maxPriorityFeePerGas = parse(data.fast.maxPriorityFee).mul(2)
  const publicLock = await PublicLock.deploy({
    maxFeePerGas,
    maxPriorityFeePerGas,
  })
  await publicLock.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `PUBLIC LOCK > deployed v${await publicLock.publicLockVersion()} to : ${
      publicLock.address
    } (tx: ${publicLock.deployTransaction.hash})`
  )

  // verify
  if (!isLocalNet) {
    try {
      await run(`verify`, { address: publicLock.address })
    } catch (error) {
      console.log(error)
    }
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
