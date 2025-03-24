/**
 * This proposal swaps ARB tokens for ETH on Arbitrum and bridges both UDT and ETH
 * back to the timelock on mainnet using the UnlockDAOArbitrumBridge contract.
 *
 * before execution, the birdge contract needs to be funded with ARB and UDT (dust)
 * so the bridge can simulate the transfer of the tokens to the bridge contract
 */
const ethers = require('ethers')
const ethers5 = require('ethers5')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { getArbitrumNetwork } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const {
  getNetwork,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const { arbitrum, mainnet } = require('@unlock-protocol/networks')
const { parseSafeMulticall } = require('../../helpers/multisig')

// The deployed UnlockDAOArbitrumBridge contract address
const UNLOCK_DAO_BRIDGE_ADDRESS = '0x86399725a83bB14C47bB5ce8311Ed25378BAa162'

// Dao
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const L2_TIMELOCK_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c'

// Arbitrum addresses
const { address: L2_ARB_TOKEN_ADDRESS } = arbitrum.tokens.find(
  ({ symbol }) => symbol === 'ARB'
)

// L1 UDT address
const L1_UDT_ADDRESS = mainnet.unlockDaoToken.address

// Bridge contract ABI
const BRIDGE_ABI = [
  'function swapAndBridgeArb(uint amountOutMinimum) external',
  'function bridgeUdt() external',
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
const l1Provider = new ethers5.providers.JsonRpcProvider(mainnet.provider)
const l2Provider = new ethers5.providers.JsonRpcProvider(arbitrum.provider)

/**
 * Creates a retryable ticket for L1->L2 message
 * @param {object} params Parameters for creating the ticket
 * @param {string} params.from The L1 sender address
 * @param {string} params.to The L2 target address
 * @param {string} params.data The calldata to execute on L2
 * @param {ethers.providers.JsonRpcProvider} params.l1Provider The L1 provider
 * @param {ethers.providers.JsonRpcProvider} params.l2Provider The L2 provider
 * @returns {Promise<{ calldata: string, value: string }>} The calldata and value for the retryable ticket
 */
async function createArbBridgeTicket({
  from,
  to,
  data,
  l1Provider,
  l2Provider,
}) {
  // Get inbox address
  const l2Network = await getArbitrumNetwork(arbitrum.id)

  const inboxAddress = l2Network.ethBridge.inbox
  const l1ToL2MessageGasEstimate = new ParentToChildMessageGasEstimator(
    l2Provider
  )

  const estimateAllParams = {
    from,
    to,
    l2CallValue: 0,
    excessFeeRefundAddress: from,
    callValueRefundAddress: from,
    data,
  }
  const baseFee = await getBaseFee(l1Provider)

  /**
   * The estimateAll method gives us the following values for sending an L1->L2 message
   * (1) maxSubmissionCost: The maximum cost to be paid for submitting the transaction
   * (2) gasLimit: The L2 gas limit
   * (3) deposit: The total amount to deposit on L1 to cover L2 gas and L2 call value
   */
  const { maxSubmissionCost, gasLimit, deposit } =
    await l1ToL2MessageGasEstimate.estimateAll(
      estimateAllParams,
      baseFee,
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

  console.log('params', params)

  const inboxContractInterface = new ethers.Interface(INBOX_ABI)
  const calldata = inboxContractInterface.encodeFunctionData(
    'createRetryableTicket',
    params
  )

  return {
    contractAddress: inboxAddress,
    calldata,
    value: ETHDeposit.toString(),
  }
}

module.exports = async ({
  fromL1 = L1_TIMELOCK_CONTRACT,
  fromL2 = L2_TIMELOCK_ALIAS,
}) => {
  console.log(
    'Proposal to swap ARB tokens for ETH on Arbitrum and bridge assets back to mainnet using UnlockDAOArbitrumBridge'
  )

  // Get inbox address
  const l2Network = await getArbitrumNetwork(arbitrum.id)

  // Get the ARB balances
  const arbToken = await getERC20Contract(L2_ARB_TOKEN_ADDRESS, l2Provider)
  const arbBalance = await arbToken.balanceOf(L2_TIMELOCK_ALIAS)
  const arbDecimals = await arbToken.decimals()

  // Get the L2 Gateway Router
  const gatewayRouterAddress = l2Network.tokenBridge.childGatewayRouter
  const gatewayRouter = new ethers.Contract(
    gatewayRouterAddress,
    GATEWAY_ROUTER_ABI,
    l2Provider
  )

  // Get L2 UDT token address and balance
  const l2UdtAddress =
    await gatewayRouter.calculateL2TokenAddress(L1_UDT_ADDRESS)
  const l2UdtToken = await getERC20Contract(l2UdtAddress, l2Provider)
  const udtBalance = await l2UdtToken.balanceOf(L2_TIMELOCK_ALIAS)

  // Create interfaces
  const bridgeInterface = new ethers.Interface(BRIDGE_ABI)

  // TODO: Add slippage protection using an oracle
  const amountOutMinimum = 0 //(arbBalance * 98n) / 100n // 2% slippage

  // 1. transfer ARB tokens to the bridge contract
  const transferArbCall = await createArbBridgeTicket({
    from: fromL1,
    to: L2_ARB_TOKEN_ADDRESS,
    data: arbToken.interface.encodeFunctionData('transfer', [
      UNLOCK_DAO_BRIDGE_ADDRESS,
      arbBalance,
    ]),
    l1Provider,
    l2Provider,
  })

  // 2. transfer ARB tokens to the bridge contract
  const transferUdtCall = await createArbBridgeTicket({
    from: fromL1,
    to: l2UdtAddress,
    data: arbToken.interface.encodeFunctionData('transfer', [
      UNLOCK_DAO_BRIDGE_ADDRESS,
      udtBalance,
    ]),
    l1Provider,
    l2Provider,
  })

  // call contract to swap and bridge arb tokens and bridge UDT
  const multicallCalls = [
    {
      contractAddress: UNLOCK_DAO_BRIDGE_ADDRESS,
      calldata: bridgeInterface.encodeFunctionData('swapAndBridgeArb', [
        amountOutMinimum,
      ]),
    },
    {
      contractAddress: UNLOCK_DAO_BRIDGE_ADDRESS,
      calldata: bridgeInterface.encodeFunctionData('bridgeUdt'),
    },
  ]

  // Encode the multicall data
  const { data: multicallData, to: multicallAddress } =
    await parseSafeMulticall({
      calls: multicallCalls,
      chainId: arbitrum.id,
    })

  // NB: this will fail because the state on Arbitrum is not ready (no ARB or UDT in bridge contract)
  // Need to fund the contract on chain for this to work
  const customBridgeCalls = await createArbBridgeTicket({
    from: fromL1,
    to: multicallAddress,
    data: multicallData,
    l1Provider,
    l2Provider,
  })

  // Return the proposal
  const proposalName = `# Swap ARB for ETH and Bridge Assets to Mainnet 

This proposal uses the UnlockDAOArbitrumBridge contract to swap ARB tokens for ETH and bridges both UDT and ETH back to the timelock on mainnet.

The UnlockDAOArbitrumBridge contract is deployed on Arbitrum at the address ${UNLOCK_DAO_BRIDGE_ADDRESS}.

The following steps are performed:

1. Transfer ARB tokens to the UnlockDAOArbitrumBridge contract
2. Transfer UDT tokens to the UnlockDAOArbitrumBridge
3. Call \`swapAndBridgeArb\` to:
   - Swap all ARB tokens for ETH (with 2% slippage protection)
   - Bridge the resulting ETH back to the timelock on mainnet
4. Call \`bridgeUdt\`  to bridge UDT tokens back to the timelock on mainnet

### Current situation of DAO's Assets on Arbitrum
- ARB Balance: ${ethers.formatUnits(arbBalance, arbDecimals)} ARB
- UDT Balance: ${ethers.formatUnits(udtBalance, 18)} UDT
- DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})

### About the proposal
The proposal contains a call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will execute a multicall transaction on Arbitrum to perform all the necessary operations.

Note that this function forces the sender to provide a reasonable amount of funds (at least enough for submitting and attempting to execute the ticket), but that doesn't guarantee a successful auto-redemption. [Check Arbitrum docs for more info.](https://docs.arbitrum.io/arbos/l1-to-l2-messaging)
`
  const calls = [transferArbCall, transferUdtCall, customBridgeCalls]

  return {
    proposalName,
    calls,
  }
}
