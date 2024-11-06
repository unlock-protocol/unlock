const { UPGovernor } = require('@unlock-protocol/contracts')

const BASE_UP_GOVERNOR_ADDRESS = '0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9'

module.exports = {
  proposalName: `Increase propoosal threshold to 50k UP
    
## Details

- Current: 0 UP
- Proposed: 50k UP

This is an urgent proposal, due to the security risk of having a 0 UP threshold. Consensus was reached to use 50k UP as the new threshold to prevent spam proposals, while not limiting access.

## Discussion

- Discussion: See Unlock DAO General channel on Discord October, 2024

## Smart Contract execution

cast calldata \"setProposalThreshold(uint256)\" 50000000000000000000000
`,
  calls: [
    {
      contractNameOrAbi: UPGovernor.abi,
      contractAddress: BASE_UP_GOVERNOR_ADDRESS,
      functionName: 'setProposalThreshold(uint256)',
      functionArgs: ['50000000000000000000000'],
    },
  ],
}
