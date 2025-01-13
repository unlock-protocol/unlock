const { ethers } = require('hardhat')
const { base } = require('@unlock-protocol/networks')
const { getERC20Contract } = require('@unlock-protocol/hardhat-helpers')

const SABLIER_ABI = [
  'function createWithDurations((address sender, address recipient, uint256 totalAmount, address asset, bool cancelable, bool transferable, (uint40 cliff, uint40 total) durations, (address account, uint256 fee) broker)) external returns (uint256)',
]

const SABLIER_V2_ADDRESS = '0x4CB16D4153123A74Bc724d161050959754f378D8' // Sablier V2 Lockup Linear contract on Base
const STREAM_DURATION = 90 * 24 * 60 * 60 // 90 days in seconds
const RECIPIENT_ADDRESS = '0xd443188B33a13A24F63AC3A49d54DB97cf64349A'
const UP_TOKEN_ADDRESS = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
const TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'
const cliffDuration = 0 // No cliff
const amount = '1000'

const createStream = async () => {
  const provider = new ethers.JsonRpcProvider(base.provider)
  const upToken = await getERC20Contract(UP_TOKEN_ADDRESS)
  const decimals = await upToken.decimals()
  const TOTAL_AMOUNT = ethers.parseUnits(amount, decimals)

  // Create params struct
  const params = {
    sender: TIMELOCK_ADDRESS,
    recipient: RECIPIENT_ADDRESS,
    totalAmount: TOTAL_AMOUNT,
    asset: UP_TOKEN_ADDRESS,
    cancelable: true,
    transferable: false,
    durations: {
      cliff: cliffDuration,
      total: STREAM_DURATION,
    },
    broker: {
      account: ethers.ZeroAddress,
      fee: 0,
    },
  }

  // Create Sablier contract instance
  const sablier = new ethers.Contract(SABLIER_V2_ADDRESS, SABLIER_ABI, provider)

  // Encode the approval call for Sablier contract
  const approvalCall = {
    contractAddress: UP_TOKEN_ADDRESS,
    calldata: upToken.interface.encodeFunctionData('approve', [
      SABLIER_V2_ADDRESS,
      TOTAL_AMOUNT,
    ]),
  }

  // Encode the stream creation call
  const createStreamCall = {
    contractAddress: SABLIER_V2_ADDRESS,
    calldata: sablier.interface.encodeFunctionData('createWithDurations', [
      params,
    ]),
    value: 0,
  }

  // Debug: Log the exact transaction data
  console.log('Debug Transaction Data:')
  console.log({
    from: TIMELOCK_ADDRESS,
    to: UP_TOKEN_ADDRESS,
    data: approvalCall.calldata,
    value: '0',
    network: 'base', // or the network ID for Base
  })

  console.log('Stream Creation Data:')
  console.log({
    from: TIMELOCK_ADDRESS,
    to: SABLIER_V2_ADDRESS,
    data: createStreamCall.calldata,
    value: '0',
    network: 'base',
  })

  return [approvalCall, createStreamCall]
}

module.exports = async () => {
  const calls = await createStream()

  const proposalName = `Create 90-day Sablier Stream

## Goal of the proposal

This proposal creates a new Sablier V2 Linear stream to distribute tokens over a 90-day period.

## About this proposal

The proposal will:
1. Create a new stream using Sablier V2 Lockup Linear contract
2. Stream ${amount} tokens over 90 days
3. Recipient: ${RECIPIENT_ADDRESS}

## Technical Details

- Sablier V2 Contract: ${SABLIER_V2_ADDRESS}
- Stream Duration: 90 days
- Start: 24 hours after proposal execution
- Distribution: Linear release over the full duration

## Security Considerations

The Sablier V2 protocol has been [audited by multiple firms](https://docs.sablier.com/concepts/protocol/security) and is widely used for streaming payments.

`

  return {
    proposalName,
    calls,
  }
}
