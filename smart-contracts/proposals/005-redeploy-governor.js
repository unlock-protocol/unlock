/**
 * Submit a proposal that
 *
 * 1. set new role
 * 2. remove existing role
 */

const { ethers } = require('hardhat')
const oldGovAddress = '0x508619074f542b6544c5835f260CC704E988cf65'
const newGovAddress = '0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9'
const timeLockAddress = '0xD7477B7c0CdA4204Cf860e4c27486061b15a5AC3'

const TIMELOCK_ADMIN_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('TIMELOCK_ADMIN_ROLE')
)

async function main() {
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
  console.log(proposalArgs)

  return proposalArgs
}

module.exports = main
