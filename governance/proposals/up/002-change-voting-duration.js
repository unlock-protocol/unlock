const { ethers } = require('hardhat')
const { UPGovernor } = require('@unlock-protocol/contracts')
const { base } = require('@unlock-protocol/networks')

const VOTING_DELAY = 4 * 24 * 60 * 60 // 4 days in seconds
const VOTING_PERIOD = 6 * 24 * 60 * 60 // 6 days in seconds
const MIN_DELAY = 2 * 24 * 60 * 60 // 2 days in seconds
const BASE_GOVERNOR_ADDRESS = base.dao.governor
const BASE_TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'

module.exports = async () => {
  console.log(`Proposal to change voting duration and minDelay`)

  // Governor interface for voting delay and voting period
  const governorInterface = new ethers.Interface(UPGovernor.abi)

  // TimelockController interface for minDelay
  const timelockInterface = new ethers.Interface([
    'function updateDelay(uint256)',
  ])

  // Encode data for each function call
  const votingDelayCalldata = governorInterface.encodeFunctionData(
    'setVotingDelay',
    [VOTING_DELAY]
  )
  const votingPeriodCalldata = governorInterface.encodeFunctionData(
    'setVotingPeriod',
    [VOTING_PERIOD]
  )
  const minDelayCalldata = timelockInterface.encodeFunctionData('updateDelay', [
    MIN_DELAY,
  ])

  // Prepare function calls
  const calls = [
    {
      contractAddress: BASE_GOVERNOR_ADDRESS,
      calldata: votingDelayCalldata,
      value: 0,
      operation: 0,
    },
    {
      contractAddress: BASE_GOVERNOR_ADDRESS,
      calldata: votingPeriodCalldata,
      value: 0,
      operation: 0,
    },
    {
      contractAddress: BASE_TIMELOCK_ADDRESS,
      calldata: minDelayCalldata,
      value: 0,
      operation: 0,
    },
  ]

  const proposalName = `Lower Voting Duration for Unlock DAO  

This proposal sets the voting delay, and voting period in the Governor contract,
as well as the minimum delay for execution (minDelay) in the timelock contract.  

## About this proposal

The proposal contains calls to update the voting delay, voting period, and 
minDelay.`

  return {
    proposalName,
    calls,
  }
}
