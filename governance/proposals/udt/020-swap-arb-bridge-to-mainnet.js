/**
 * This proposal swaps ARB tokens for ETH on Arbitrum and bridges both UDT and ETH
 * back to the timelock on mainnet using the UnlockDAOArbitrumBridge contract.
 */
const ethers = require('ethers')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { arbitrum, mainnet } = require('@unlock-protocol/networks')

// Dao
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'

// Arbitrum addresses
const { address: L2_ARB_TOKEN_ADDRESS } = arbitrum.tokens.find(
  ({ symbol }) => symbol === 'ARB'
)

// L1 UDT address
const L1_UDT_ADDRESS = mainnet.unlockDaoToken.address

// TODO: Replace with actual deployed bridge contract address
const UNLOCK_DAO_BRIDGE_ADDRESS = '0x...'

// Bridge contract ABI
const BRIDGE_ABI = [
  'function swapAndBridgeArb(uint amountOutMinimum) external payable',
]

// Arbitrum Gateway Router ABI
const GATEWAY_ROUTER_ABI = [
  'function outboundTransfer(address _l1Token, address _to, uint256 _amount, bytes calldata _data) external payable returns (bytes memory)',
  'function calculateL2TokenAddress(address l1ERC20) external view returns (address)',
]

// Arbitrum Inbox ABI for L1-to-L2 messaging
const INBOX_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'l2CallValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxSubmissionCost',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'excessFeeRefundAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'callValueRefundAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'gasLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxFeePerGas',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'createRetryableTicket',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
]

// providers
const l1Provider = new ethers.JsonRpcProvider(mainnet.provider)
const l2Provider = new ethers.JsonRpcProvider(arbitrum.provider)

module.exports = async ({
  fromL1 = L1_TIMELOCK_CONTRACT,
  fromL2 = L2_TIMELOCK_ALIAS,
}) => {
  console.log(
    'Proposal to swap ARB tokens for ETH on Arbitrum and bridge assets back to mainnet using UnlockDAOArbitrumBridge'
  )

  // Get inbox address
  const l2Network = await getL2Network(l2Provider)
  const inboxAddress = l2Network.ethBridge.inbox

  // Get the ARB balances
  const arbToken = await getERC20Contract(L2_ARB_TOKEN_ADDRESS, l2Provider)
  const arbBalance = await arbToken.balanceOf(fromL2)
  const arbDecimals = await arbToken.decimals()

  // Get the L2 Gateway Router
  const gatewayRouter = new ethers.Contract(
    arbitrum.arbitrumGatewayRouter,
    GATEWAY_ROUTER_ABI,
    l2Provider
  )

  // Get L2 UDT token address and balance
  const l2UdtAddress =
    await gatewayRouter.calculateL2TokenAddress(L1_UDT_ADDRESS)
  const l2UdtToken = await getERC20Contract(l2UdtAddress, l2Provider)
  const udtBalance = await l2UdtToken.balanceOf(fromL2)

  // Create interfaces
  const bridgeInterface = new ethers.Interface(BRIDGE_ABI)
  const inboxContractInterface = new ethers.Interface(INBOX_ABI)

  // TODO: Add slippage protection using an oracle
  const amountOutMinimum = (arbBalance * 98n) / 100n // 2% slippage

  // We'll use the Multicall3 contract on Arbitrum to batch these transactions
  const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

  // Multicall ABI
  const multicallInterface = new ethers.Interface([
    'function aggregate(tuple(address target, bytes callData)[] calls) external payable returns (uint256 blockNumber, bytes[] returnData)',
  ])

  // Prepare the multicall data
  const multicallCalls = [
    // 1. Approve bridge contract to spend ARB tokens
    {
      target: L2_ARB_TOKEN_ADDRESS,
      callData: arbToken.interface.encodeFunctionData('approve', [
        UNLOCK_DAO_BRIDGE_ADDRESS,
        arbBalance,
      ]),
    },
    // 2. Call swapAndBridgeArb
    {
      target: UNLOCK_DAO_BRIDGE_ADDRESS,
      callData: bridgeInterface.encodeFunctionData('swapAndBridgeArb', [
        amountOutMinimum,
      ]),
    },
    // 3. Approve gateway router to spend UDT tokens
    {
      target: l2UdtAddress,
      callData: l2UdtToken.interface.encodeFunctionData('approve', [
        arbitrum.arbitrumGatewayRouter,
        udtBalance,
      ]),
    },
    // 4. Bridge UDT tokens using gateway router
    {
      target: arbitrum.arbitrumGatewayRouter,
      callData: gatewayRouter.interface.encodeFunctionData('outboundTransfer', [
        L1_UDT_ADDRESS,
        L1_TIMELOCK_CONTRACT,
        udtBalance,
        '0x', // no extra data needed
      ]),
    },
  ]

  // Encode the multicall data
  const multicallData = multicallInterface.encodeFunctionData('aggregate', [
    multicallCalls,
  ])

  /**
   * Now we can query the required gas params using the estimateAll method in Arbitrum SDK
   */
  const l1ToL2MessageGasEstimate = new ParentToChildMessageGasEstimator(
    l2Provider
  )

  const estimateAllParams = {
    from: fromL1,
    to: MULTICALL_ADDRESS,
    l2CallValue: 0,
    excessFeeRefundAddress: fromL1,
    callValueRefundAddress: fromL1,
    data: multicallData,
  }

  /**
   * The estimateAll method gives us the following values for sending an L1->L2 message
   * (1) maxSubmissionCost: The maximum cost to be paid for submitting the transaction
   * (2) gasLimit: The L2 gas limit
   * (3) deposit: The total amount to deposit on L1 to cover L2 gas and L2 call value
   */
  const { maxSubmissionCost, gasLimit, deposit } =
    await l1ToL2MessageGasEstimate.estimateAll(
      estimateAllParams,
      await getBaseFee(l1Provider),
      l1Provider
    )
  const gasPriceBid = await l2Provider.getGasPrice()
  const ETHDeposit = deposit.toNumber() * 10 // Multiply by 10 to add extra in case gas changes due to proposal delay

  const params = [
    estimateAllParams.to,
    estimateAllParams.l2CallValue,
    maxSubmissionCost.toString(), // maxSubmissionCost
    estimateAllParams.excessFeeRefundAddress,
    estimateAllParams.callValueRefundAddress,
    gasLimit.toString(), // gasLimit
    gasPriceBid.toString(), // maxFeePerGas
    estimateAllParams.data,
  ]

  const inboxCalldata = inboxContractInterface.encodeFunctionData(
    'createRetryableTicket',
    params
  )

  // Return the proposal
  const proposalName = `# Swap ARB for ETH and Bridge Assets to Mainnet 

This proposal uses the UnlockDAOArbitrumBridge contract to swap ARB tokens for ETH and bridges both UDT and ETH back to the timelock on mainnet.

The UnlockDAOArbitrumBridge contract is deployed on Arbitrum at the address ${UNLOCK_DAO_BRIDGE_ADDRESS}.

The following steps are performed:

1. Approve the UnlockDAOArbitrumBridge contract to spend ARB tokens
2. Call \`swapAndBridgeArb\` to:
   - Swap all ARB tokens for ETH (with 2% slippage protection)
   - Bridge the resulting ETH back to the timelock on mainnet
3. Approve the Arbitrum Gateway Router to spend UDT tokens
4. Bridge all UDT tokens back to the timelock on mainnet using the Arbitrum Gateway Router

### Current situation of DAO's Assets on Arbitrum
- ARB Balance: ${ethers.formatUnits(arbBalance, arbDecimals)} ARB
- UDT Balance: ${ethers.formatUnits(udtBalance, 18)} UDT
- DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})

### About the proposal
The proposal contains a call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will execute a multicall transaction on Arbitrum to perform all the necessary operations.

Note that this function forces the sender to provide a reasonable amount of funds (at least enough for submitting and attempting to execute the ticket), but that doesn't guarantee a successful auto-redemption. [Check Arbitrum docs for more info.](https://docs.arbitrum.io/arbos/l1-to-l2-messaging)
`

  const calls = [
    {
      contractAddress: inboxAddress,
      calldata: inboxCalldata,
      value: ETHDeposit.toString(),
    },
  ]

  return {
    proposalName,
    calls,
  }
}
