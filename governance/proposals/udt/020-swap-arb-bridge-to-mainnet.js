/**
 * This proposal swaps ARB tokens for ETH on Arbitrum and bridges both UDT and ETH
 * back to the timelock on mainnet.
 */
const ethers = require('ethers')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { EthBridger, getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { arbitrum, mainnet } = require('@unlock-protocol/networks')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')

// Dao
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'

// Arbitrum addresses
const { address: L2_ARB_TOKEN_ADDRESS } = arbitrum.tokens.find(
  ({ symbol }) => symbol === 'ARB'
)
const L2_UNISWAP_ROUTER_ADDRESS = arbitrum.uniswapV3.universalRouterAddress
const L2_WETH_ADDRESS = arbitrum.nativeCurrency.wrapped
const L2_UDT_ADDRESS = arbitrum.unlockDaoToken.address

// Uniswap V3 SwapRouter ABI
const UNISWAP_ROUTER_ABI = [
  'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
  'function unwrapWETH9(uint256 amountMinimum, address recipient) external payable',
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
    'Proposal to swap ARB tokens for ETH on Arbitrum and bridge assets back to mainnet'
  )

  // Get inbox address
  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox

  // Get the ARB balances
  const arbToken = await getERC20Contract(L2_ARB_TOKEN_ADDRESS, l2Provider)
  const arbBalance = await arbToken.balanceOf(fromL2)
  const arbDecimals = await arbToken.decimals()

  // Create interfaces
  const uniswapRouterInterface = new ethers.Interface(UNISWAP_ROUTER_ABI)
  const inboxContractInterface = new ethers.Interface(INBOX_ABI)

  // TODO:set deadline after dao proposal is executed
  const deadline = Math.floor(Date.now() / 1000) + 30 * 60

  // TODO: Add slippage protection
  const amountOutMinimum = 0

  // We'll use the Multicall3 contract on Arbitrum to batch these transactions
  const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

  // Multicall ABI
  const multicallInterface = new ethers.Interface([
    'function aggregate(tuple(address target, bytes callData)[] calls) external payable returns (uint256 blockNumber, bytes[] returnData)',
  ])

  // Prepare the multicall data
  const multicallCalls = [
    // 1. Approve Uniswap Router to spend ARB tokens
    {
      target: L2_ARB_TOKEN_ADDRESS,
      callData: arbToken.interface.encodeFunctionData('approve', [
        L2_UNISWAP_ROUTER_ADDRESS,
        arbBalance,
      ]),
    },

    // 2. Swap ARB for WETH using Uniswap V3
    {
      target: L2_UNISWAP_ROUTER_ADDRESS,
      callData: uniswapRouterInterface.encodeFunctionData('exactInputSingle', [
        [
          L2_ARB_TOKEN_ADDRESS, // tokenIn
          L2_WETH_ADDRESS, // tokenOut
          3000, // fee (0.3%)
          fromL2, // recipient
          deadline, // deadline
          arbBalance, // amountIn
          amountOutMinimum, // amountOutMinimum
          0, // sqrtPriceLimitX96 (0 = no limit)
        ],
      ]),
    },

    // 3. Unwrap WETH to ETH
    {
      target: L2_UNISWAP_ROUTER_ADDRESS,
      callData: uniswapRouterInterface.encodeFunctionData('unwrapWETH9', [
        0, // amountMinimum (0 since we already applied slippage)
        fromL2, // recipient
      ]),
    },
  ]

  // Encode the multicall data
  const multicallData = multicallInterface.encodeFunctionData('aggregate', [
    multicallCalls,
  ])

  // Encode the L1-to-L2 message
  const transferCalldata = multicallData

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
    data: transferCalldata,
  }

  /**
   * The estimateAll method gives us the following values for sending an L1->L2 message
   * (1) maxSubmissionCost: The maximum cost to be paid for submitting the transaction
   * (2) gasLimit: The L2 gas limit
   * (3) deposit: The total amount to deposit on L1 to cover L2 gas and L2 call value
   */
  const L1ToL2MessageGasParams = await l1ToL2MessageGasEstimate.estimateAll(
    estimateAllParams,
    await getBaseFee(l1Provider),
    l1Provider
  )
  const gasPriceBid = await l2Provider.getGasPrice()
  const ETHDeposit = L1ToL2MessageGasParams.deposit.toNumber() * 10 // Multiply by 10 to add extra in case gas changes due to proposal delay

  const params = [
    estimateAllParams.to,
    estimateAllParams.l2CallValue,
    L1ToL2MessageGasParams.maxSubmissionCost.toString(), // maxSubmissionCost
    estimateAllParams.excessFeeRefundAddress,
    estimateAllParams.callValueRefundAddress,
    L1ToL2MessageGasParams.gasLimit.toString(), // gasLimit
    gasPriceBid.toString(), // maxFeePerGas
    estimateAllParams.data,
  ]

  const inboxCalldata = inboxContractInterface.encodeFunctionData(
    'createRetryableTicket',
    params
  )

  // Return the proposal
  const proposalName = `# Swap ARB for ETH and Bridge Assets to Mainnet

This proposal will:
1. Swap all ARB tokens held by the DAO on Arbitrum for ETH (with slippage protection)
2. Bridge all UDT tokens from Arbitrum back to the timelock on mainnet
3. Bridge all ETH (including the newly swapped ETH) back to the timelock on mainnet

### Current situation of DAO's ARB Tokens
- Total: ${ethers.formatUnits(arbBalance, decimals)} ARB
- DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})

### About the proposal
The proposal contains a call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will execute a multicall transaction on Arbitrum to:
1. Approve the Uniswap Router to spend ARB tokens
2. Swap ARB tokens for ETH using Uniswap V3
3. Unwrap WETH to native ETH

After this proposal is executed, we will need to submit additional proposals to:
1. Bridge UDT tokens back to mainnet
2. Bridge ETH back to mainnet

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
