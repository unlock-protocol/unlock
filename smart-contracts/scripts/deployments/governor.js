const { ethers, upgrades } = require('hardhat')

const { getNetworkName } = require('../../helpers/network')
const ZERO_ADDRESS = web3.utils.padLeft(0, 40)

const TIMELOCK_ADMIN_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('TIMELOCK_ADMIN_ROLE')
)
const PROPOSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PROPOSER_ROLE')
)

async function main({ udtAddress, timelockAddress, testing } = {}) {
  const [unlockOwner] = await ethers.getSigners()

  // fetch chain info
  const chainId = await unlockOwner.getChainId()
  const networkName = getNetworkName(chainId)

  // eslint-disable-next-line no-console
  console.log(
    `Deploying Governor on ${networkName} with the account: ${unlockOwner.address}...`
  )

  let timelock
  if (!timelockAddress) {
    // deploying Unlock Protocol with a proxy
    const UnlockProtocolTimelock = await ethers.getContractFactory(
      'UnlockProtocolTimelock'
    )
    // time lock in seconds
    const oneWeekInSeconds = 60 * 60 * 24 * 7
    const MINDELAY = testing ? 30 : oneWeekInSeconds

    timelock = await upgrades.deployProxy(UnlockProtocolTimelock, [
      MINDELAY,
      [], // proposers list is empty at deployment
      [ZERO_ADDRESS], // allow any address to execute a proposal once the timelock has expired
    ])
    await timelock.deployed()

    // eslint-disable-next-line no-console
    console.log(
      '> Timelock w proxy deployed at:',
      timelock.address,
      ` (tx: ${timelock.deployTransaction.hash})`
    )
  } else {
    timelock = await ethers.getContractAt(
      'UnlockProtocolTimelock',
      timelockAddress
    )
  }

  // deploying Unlock Protocol with a proxy
  const UnlockProtocolGovernor = await ethers.getContractFactory(
    'UnlockProtocolGovernor'
  )

  // get UDT token address
  if (!udtAddress) {
    throw new Error('Missing UDT address.')
  }
  console.log(`Using :
   - UDT: ${udtAddress}
   - timelock: ${timelock.address}`)

  // deploy governor proxy
  const votingPeriod = testing ? 20 : 45818 // 1 week
  const governor = await upgrades.deployProxy(UnlockProtocolGovernor, [
    udtAddress,
    votingPeriod,
    timelock.address,
  ])
  await governor.deployed()

  // eslint-disable-next-line no-console
  console.log(
    '> Governor deployed (w proxy) at:',
    governor.address,
    ` (tx: ${governor.deployTransaction.hash})`
  )

  // governor should be the only proposer
  await timelock.grantRole(PROPOSER_ROLE, governor.address)

  // eslint-disable-next-line no-console
  console.log(
    '> Governor added to Timelock as sole proposer. ',
    `${governor.address} is Proposer: ${await timelock.hasRole(
      PROPOSER_ROLE,
      governor.address
    )} `
  )

  // deployer should renounced the Admin role after setup (leaving only Timelock as Admin)
  await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, unlockOwner.address)

  // eslint-disable-next-line no-console
  console.log(
    '> Unlock Owner recounced Admin Role. ',
    `${unlockOwner.address} isAdmin: ${await timelock.hasRole(
      TIMELOCK_ADMIN_ROLE,
      unlockOwner.address
    )} `
  )
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
