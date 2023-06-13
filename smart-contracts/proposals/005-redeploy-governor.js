/**
 * Submit a proposal that
 *
 * 1. deploy a new instance of Governor (if necessary)
 * 2. set new governor as admin of the timelock
 * 3. remove existing governor as admin of the timelock
 */

const { ethers, upgrades, run } = require('hardhat')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

const oldGovAddress = '0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9'

async function main({ newGovAddress } = {}) {
  // get addresses
  const oldGov = await ethers.getContractAt(
    'UnlockProtocolGovernor',
    oldGovAddress
  )

  const timeLockAddress = await oldGov.timelock()
  const tokenAddress = await oldGov.token()

  const timelock = await ethers.getContractAt(
    'UnlockProtocolTimelock',
    timeLockAddress
  )
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE()

  // show some info in terminal
  console.log(`redeploying Governor:
  - timelock: ${timeLockAddress}
  - token: ${tokenAddress}`)

  // deploy new instance of gov if necessary
  if (!newGovAddress) {
    const Governor = await ethers.getContractFactory('UnlockProtocolGovernor')

    const governor = await upgrades.deployProxy(Governor, [
      tokenAddress,
      timeLockAddress,
    ])
    await governor.deployed()
    newGovAddress = governor.address

    const implementation = await getImplementationAddress(
      ethers.provider,
      newGovAddress
    )
    await run('verify:verify', {
      address: implementation,
    })
  }

  const proposalGrantRoleArgs = {
    contractName: 'UnlockProtocolTimelock',
    contractAddress: timeLockAddress,
    functionName: 'grantRole',
    functionArgs: [TIMELOCK_ADMIN_ROLE, newGovAddress],
  }

  const proposalRevokeRoleArgs = {
    contractName: 'UnlockProtocolTimelock',
    contractAddress: timeLockAddress,
    functionName: 'revokeRole',
    functionArgs: [TIMELOCK_ADMIN_ROLE, oldGovAddress],
  }

  const proposalArgs = {
    calls: [proposalGrantRoleArgs, proposalRevokeRoleArgs],
    proposalName: 'Switch Timelock admin role to the new Governor',
  }

  return proposalArgs
}

module.exports = main
