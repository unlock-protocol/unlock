const { UPGovernor, UPTimelock } = require('@unlock-protocol/contracts')

const BASE_UP_GOVERNOR_ADDRESS = '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9'
const BASE_UP_TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'

module.exports = {
  proposalName:
    'Reduce proposal duration to 14 days\n\n## Details\n\n- Current: 6 day delay, 6 day voting, 7 day to execute. Total is ~3 weeks\n- Proposed: 4 day delay, 8 day voting, 2 day to execute: Total of 14 days\n\n## Discussion\n\n- Discussion: See DAO call from 10/8/24 \n- Passing snapshot: https://snapshot.org/#/unlock-dao.eth/proposal/0x4b0c8ff323095ba959b0470887d46ca8ad88d910fe3d3363bf69c5cea82ff818\n\n## Smart Contract execution\n\n1. setVotingDelay(345600) 4 days on Governor 0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9 `cast calldata "setVotingDelay(uint48)" 345600`\n2. setVotingPeriod(691200) 8 days on Governor 0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9 `cast calldata "setVotingPeriod(uint32)" 691200`\n3. updateDelay(172800) 2 days on TimelockController 0xB34567C4cA697b39F72e1a8478f285329A98ed1b `cast calldata "updateDelay(uint256)" 172800',
  calls: [
    {
      contractNameOrAbi: UPGovernor.abi,
      contractAddress: BASE_UP_GOVERNOR_ADDRESS,
      functionName: 'setVotingDelay(uint48)',
      functionArgs: [345600],
    },
    {
      contractNameOrAbi: UPGovernor.abi,
      contractAddress: BASE_UP_GOVERNOR_ADDRESS,
      functionName: 'setVotingPeriod(uint32)',
      functionArgs: [691200],
    },
    {
      contractNameOrAbi: UPTimelock.abi,
      contractAddress: BASE_UP_TIMELOCK_ADDRESS,
      functionName: 'updateDelay(uint256)',
      functionArgs: [172800],
    },
  ],
}
