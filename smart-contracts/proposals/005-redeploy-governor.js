/**
 * Submit a proposal that
 *
 * 1. deploy a new instance of Governor (if necessary)
 * 2. set new governor as admin of the timelock
 * 3. remove existing governor as admin of the timelock
 *
 * To use, you need to pass the address of the current gov as first positional parameter.
 *
 * ## Submit the proposal
 *
 * ```
 * yarn hardhat gov:submit --gov-address 0x7757f7f21f5fa9b1fd168642b79416051cd0bb94  \
 *    --network localhost \
 *    --proposal proposals/005-redeploy-governor.js \
 *    0x7757f7f21f5fa9b1fd168642b79416051cd0bb94
 * ```
 *
 * ## Vote for proposal
 *
 * To vote, you need to retrieve the address of the freshly deployed Governor instance and
 * add it as second positional parameter
 *
 * ```
 * yarn hardhat gov:vote --gov-address 0x7757f7f21f5fa9b1fd168642b79416051cd0bb94  \
 *  --network localhost \
 *  --proposal proposals/005-redeploy-governor.js
 *  0x7757f7f21f5fa9b1fd168642b79416051cd0bb94 0xaB82D702A4e0cD165072C005dc504A21c019718F
 * ```
 */

const { ethers, upgrades, run } = require('hardhat')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

async function main([oldGovAddress, newGovAddress]) {
  if (!oldGovAddress) {
    throw Error(`Missing old governor address.`)
  }
  // get addresses
  const oldGovernor = await ethers.getContractAt(
    'UnlockProtocolGovernor',
    oldGovAddress
  )

  const timeLockAddress = await oldGovernor.timelock()
  const tokenAddress = await oldGovernor.token()

  const timelock = await ethers.getContractAt(
    'UnlockProtocolTimelock',
    timeLockAddress
  )
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE()
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE()

  // show old gov info in terminal
  console.log(`previous Governor deployment:
  - timelock: ${timeLockAddress}
  - token: ${tokenAddress}`)

  // deploy new instance of gov if necessary
  if (!newGovAddress) {
    console.log(`Redeploying governor...`)
    const Governor = await ethers.getContractFactory('UnlockProtocolGovernor')

    const votingPeriod = await oldGovernor.votingPeriod()
    const votingDelay = await oldGovernor.votingDelay()
    const currentBlock = await ethers.provider.getBlockNumber()
    const quorum = await oldGovernor.quorum(currentBlock - 1)

    const governor = await upgrades.deployProxy(Governor, [
      tokenAddress,
      votingDelay,
      votingPeriod,
      quorum,
      timeLockAddress,
    ])
    await governor.deployed()
    newGovAddress = governor.address

    console.log(
      `Governor deployed at ${newGovAddress} (tx: ${governor.deployTransaction.hash})`
    )

    const implementation = await getImplementationAddress(
      ethers.provider,
      newGovAddress
    )
    if (!process.env.RUN_FORK) {
      await run('verify:verify', {
        address: implementation,
      })
    }
  }

  console.log(`Transfering governor from ${oldGovAddress} to ${newGovAddress}.`)

  const calls = [
    {
      contractName: 'UnlockProtocolTimelock',
      contractAddress: timeLockAddress,
      functionName: 'grantRole',
      functionArgs: [TIMELOCK_ADMIN_ROLE, newGovAddress],
    },
    {
      contractName: 'UnlockProtocolTimelock',
      contractAddress: timeLockAddress,
      functionName: 'grantRole',
      functionArgs: [PROPOSER_ROLE, newGovAddress],
    },
    {
      contractName: 'UnlockProtocolTimelock',
      contractAddress: timeLockAddress,
      functionName: 'revokeRole',
      functionArgs: [TIMELOCK_ADMIN_ROLE, oldGovAddress],
    },
    {
      contractName: 'UnlockProtocolTimelock',
      contractAddress: timeLockAddress,
      functionName: 'revokeRole',
      functionArgs: [PROPOSER_ROLE, oldGovAddress],
    },
  ]

  const proposalArgs = {
    calls,
    proposalName: 'Switch Timelock admin role to the new Governor',
  }

  return proposalArgs
}

module.exports = main
