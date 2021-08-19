const { ethers, upgrades } = require('hardhat')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const { getNetworkName } = require('../helpers/network')
const { getDeployment, addDeployment } = require('../helpers/deployments')

async function main() {
  const [unlockOwner, proposer, executor] = await ethers.getSigners()

  // fetch chain info
  const chainId = await unlockOwner.getChainId()
  const networkName = getNetworkName(chainId)

  // eslint-disable-next-line no-console
  console.log(
    `Deploying Timelock on ${networkName} with the account: ${unlockOwner.address}...`
  )

  // deploying Unlock Protocol with a proxy
  const UnlockDiscountTokenTimelock = await ethers.getContractFactory(
    'UnlockDiscountTokenTimelock'
  )

  // one week in seconds
  const MINDELAY = 60 * 24 * 7

  const timelock = await upgrades.deployProxy(UnlockDiscountTokenTimelock, [
    MINDELAY,
    [proposer.address],
    [executor.address],
  ])
  await timelock.deployed()

  // eslint-disable-next-line no-console
  console.log('> Timelock w proxy deployed to:', timelock.address)

  // save deployment info
  await addDeployment('UnlockDiscountTokenTimelock', timelock, true)

  // eslint-disable-next-line no-console
  console.log('---')

  // eslint-disable-next-line no-console
  console.log(
    `Deploying Unlock Governor on ${networkName} with the account: ${unlockOwner.address}...`
  )

  // deploying Unlock Protocol with a proxy
  const UnlockProtocolGovernor = await ethers.getContractFactory(
    'UnlockProtocolGovernor'
  )

  // get UDT token address
  let tokenAddress
  if (networkName === 'localhost') {
    const UDTInfo = await getDeployment(chainId, 'UnlockDiscountToken')
    tokenAddress = UDTInfo.address
  } else {
    const [UDTInfo] =
      OZ_SDK_EXPORT.networks[networkName].proxies[
        'unlock-protocol/UnlockDiscountToken'
      ]
    tokenAddress = UDTInfo.address
  }

  // deploy governor proxy
  const governor = await upgrades.deployProxy(UnlockProtocolGovernor, [
    tokenAddress,
    timelock.address,
  ])
  await governor.deployed()

  // eslint-disable-next-line no-console
  console.log('> Governor deployed (w proxy) to:', governor.address)

  // save deployment info
  await addDeployment('UnlockProtocolGovernor', governor, true)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
