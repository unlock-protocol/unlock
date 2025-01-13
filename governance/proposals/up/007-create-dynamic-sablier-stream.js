const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

// Sablier V2 Lockup Dynamic contract on Base
const SABLIER_V2_DYNAMIC_ADDRESS = '0x66aB1C8Ff5AEBD4F2E7CD40Bc9C09DA11A6e096c'
const STREAM_DURATION = 180 * 24 * 60 * 60 // 180 days in seconds
const RECIPIENT_ADDRESS = '0x123...789' // Replace with actual recipient address
const TOTAL_AMOUNT = ethers.parseEther('1000') // Total amount to stream

// Sablier V2 Lockup Dynamic ABI (only the functions we need)
const SABLIER_DYNAMIC_ABI = [
  'function createWithMilestones(address recipient, uint256 totalAmount, address asset, (uint40 milestone, uint256 amount)[] milestones) external returns (uint256)',
]

const createDynamicStream = async () => {
  const { provider } = await getNetwork()

  // Calculate stream timing
  const currentBlock = await provider.getBlock('latest')
  const startTime = currentBlock.timestamp + 24 * 60 * 60 // Start 24h after proposal execution

  // Create milestone segments for a 6-month vesting with:
  // - 20% initial cliff after 30 days
  // - 30% released over next 60 days
  // - 50% released over final 90 days
  const milestones = [
    // 20% cliff after 30 days
    {
      milestone: startTime + 30 * 24 * 60 * 60,
      amount: (TOTAL_AMOUNT * 20n) / 100n,
    },
    // 30% over next 60 days
    {
      milestone: startTime + 90 * 24 * 60 * 60,
      amount: (TOTAL_AMOUNT * 50n) / 100n, // cumulative 50%
    },
    // Final 50% over last 90 days
    {
      milestone: startTime + STREAM_DURATION,
      amount: TOTAL_AMOUNT, // cumulative 100%
    },
  ]

  // Create Sablier contract instance
  const sablier = new ethers.Contract(
    SABLIER_V2_DYNAMIC_ADDRESS,
    SABLIER_DYNAMIC_ABI,
    provider
  )

  // Encode the function call
  const createStreamCall = sablier.interface.encodeFunctionData(
    'createWithMilestones',
    [RECIPIENT_ADDRESS, TOTAL_AMOUNT, await sablier.getAddress(), milestones]
  )

  return {
    contractAddress: SABLIER_V2_DYNAMIC_ADDRESS,
    calldata: createStreamCall,
    value: TOTAL_AMOUNT,
  }
}

module.exports = async () => {
  const call = await createDynamicStream()

  const proposalName = `Create 6-month Dynamic Sablier Stream

## Goal of the proposal

This proposal creates a new Sablier V2 Dynamic stream with a custom vesting schedule over 6 months.

## About this proposal

The proposal will create a dynamic stream with the following schedule:
1. 20% cliff release after 30 days (200 tokens)
2. 30% linear release over next 60 days (300 tokens)
3. 50% linear release over final 90 days (500 tokens)

## Technical Details

- Sablier V2 Dynamic Contract: ${SABLIER_V2_DYNAMIC_ADDRESS}
- Total Amount: ${ethers.formatEther(TOTAL_AMOUNT)} tokens
- Duration: 180 days
- Recipient: ${RECIPIENT_ADDRESS}
- Start: 24 hours after proposal execution

## Security Considerations

The Sablier V2 protocol has been [audited by multiple firms](https://docs.sablier.com/concepts/protocol/security) and the Dynamic stream type allows for flexible vesting schedules while maintaining the security guarantees of the protocol.

The Unlock Protocol Team
`

  return {
    proposalName,
    calls: [call],
  }
}
