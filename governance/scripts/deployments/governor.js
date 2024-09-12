const { ethers } = require('hardhat')
const {
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
  getNetwork,
  ADDRESS_ZERO,
} = require('@unlock-protocol/hardhat-helpers')

const TIMELOCK_ADMIN_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes('TIMELOCK_ADMIN_ROLE')
)
const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('PROPOSER_ROLE'))

async function main({ upAddress, timelockAddress } = {}) {
  const [deployer] = await ethers.getSigners()
  const deployerAddress = await deployer.getAddress()

  // fetch chain info
  const { id, name, isTestNetwork } = await getNetwork()
  console.log(
    `Deploying Governor on ${name} (${id}) with the account ${deployerAddress}...`
  )

  // get timelock factory
  const [timelockQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPTimelock', subfolder: 'UP' }]
  )
  const UPTimelock = await ethers.getContractFactory(timelockQualifiedPath)

  if (!timelockAddress) {
    // time lock delay in seconds
    const oneWeekInSeconds = 60 * 60 * 24 * 7
    const MINDELAY = isTestNetwork ? 30 : oneWeekInSeconds

    // deploying timelock with a proxy
    ;({ address: timelockAddress } = await deployUpgradeableContract(
      UPTimelock,
      [
        MINDELAY,
        [], // proposers list is empty as anyone can propose
        [ADDRESS_ZERO], // allow any address to execute a proposal once the timelock has expired
        deployerAddress, // tmp timelock admin (removed in next step)
      ]
    ))
  }

  // get governor factory
  const [govQualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    { contractName: 'UPGovernor', subfolder: 'UP' },
  ])
  const UPGovernor = await ethers.getContractFactory(govQualifiedPath)

  // get UDT token address
  if (!upAddress) {
    throw new Error('Missing UP address.')
  }
  console.log(`Using :
   - UDT: ${upAddress}
   - timelock: ${timelockAddress}`)

  // deploy governor proxy
  const { address: govAddress } = await deployUpgradeableContract(UPGovernor, [
    upAddress,
    timelockAddress,
  ])

  // governor should be the only proposer
  const timelock = await UPTimelock.attach(timelockAddress)
  await timelock.grantRole(PROPOSER_ROLE, govAddress)

  // eslint-disable-next-line no-console
  console.log(
    '> Governor added to Timelock as sole proposer. ',
    `${govAddress} is Proposer: ${await timelock.hasRole(
      PROPOSER_ROLE,
      govAddress
    )} `
  )

  // deployer should renounced the Admin role after setup (leaving only Timelock as admin of itself)
  await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployerAddress)

  // eslint-disable-next-line no-console
  console.log(
    '> Unlock Owner recounced Admin Role. ',
    `${deployerAddress} isAdmin: ${await timelock.hasRole(
      TIMELOCK_ADMIN_ROLE,
      deployerAddress
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
