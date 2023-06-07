/**
 * Submit a proposal that
 *
 * 1. set new role
 * 2. remove existing role
 */

const { ethers } = require('hardhat')
const oldGovAddress = '0x508619074f542b6544c5835f260CC704E988cf65'
const newGovAddress = '0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9'

async function main() {
  // get addresses
  const oldGov = await ethers.getContractAt(
    'UnlockProtocolGovernor',
    oldGovAddress
  )
  const timeLockAddress = oldGov.timeLock()
  const TIMELOCK_ADMIN_ROLE = oldGov.TIMELOCK_ADMIN_ROLE()

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
