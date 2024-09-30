const ethers = require('ethers')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { EthBridger, getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')

const BURNER_CONTRACT = '0x52818DF6575d88Fd1AFBd63071078D6374c11F16' // Burner contract on Arbitrum
const TIMELOCK_L2_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c' // Timelock Alias Address on L2
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B' // Timelock Address mainnet

// ARB TOKEN ADDRESS ON ARBITRUM ONE
const { address: ARB_TOKEN_ADRESS_ON_L2 } = arbitrum.tokens.find(
  ({ symbol }) => symbol === 'ARB'
)
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
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

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */

const l1Provider = new ethers.JsonRpcProvider(mainnet.provider)
const l2Provider = new ethers.JsonRpcProvider(arbitrum.provider)
const amount = '23000'

module.exports = async ({
  tokenAddressL2 = ARB_TOKEN_ADRESS_ON_L2,
  fromL1 = L1_TIMELOCK_CONTRACT,
  toL2 = BURNER_CONTRACT,
  fromL2 = TIMELOCK_L2_ALIAS,
}) => {
  console.log(
    'Proposal to approve a burner contract to swap ARB for UDT and burn it'
  )

  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox

  // token on L2
  const L2TokenContract = new ethers.Contract(
    tokenAddressL2,
    ERC20_ABI,
    l2Provider
  )
  const decimals = await L2TokenContract.decimals()

  // check balance of sender on L2
  const balanceOf = await L2TokenContract.balanceOf(fromL2)
  const tokenAmount = ethers.utils.parseUnits(amount, decimals)

  // Create an instance of the Interface from the ABIs
  const erc20ContractInterface = new ethers.utils.Interface(ERC20_ABI)
  const inboxContractInterface = new ethers.utils.Interface(INBOX_ABI)

  // Encode the ERC20 Token transfer calldata
  const transferCalldata = erc20ContractInterface.encodeFunctionData(
    'approve',
    [toL2, tokenAmount]
  )

  /**
   * Now we can query the required gas params using the estimateAll method in Arbitrum SDK
   */
  const l1ToL2MessageGasEstimate = new ParentToChildMessageGasEstimator(
    l2Provider
  )

  const estimateAllParams = {
    from: fromL1,
    to: tokenAddressL2,
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
  const ETHDeposit = L1ToL2MessageGasParams.deposit.toNumber() * 10 // I Multiply by 10 to add extra in case gas changes due to proposal delay

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

  const proposalName = `
  # Approve ${amount} ARB to buy back and burn UDT
  
  ### Goal of the proposal
   This proposal requests to use ${amount} ARB from the tokens given to Unlock Protocol DAO by ArbitrumDAO to buy back and burn UDT. If successful, we can later submit more proposals to approve more tokens.
  
  #### Current situation of DAO's ARB Tokens
    - total: ${ethers.utils.formatUnits(balanceOf, decimals).toString()} ARB.
    - DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})

  For Reference, this is [the thread on Discord](https://discord.com/channels/462280183425138719/1239625381246533632)
    
  #### About the proposal
    The proposal contains a single call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will attempt to execute an L2 request to the ARB token contract to approve ${ethers.utils
      .formatUnits(tokenAmount, decimals)
      .toString()} of token from the Timelock L2 Alias address \`${fromL2}\` to the [swap and burn contract](https://arbiscan.io/address/${BURNER_CONTRACT}) - \`approve(${toL2},${ethers.utils
      .formatUnits(tokenAmount, decimals)
      .toString()})\`.

    Once approved and executed, the request will be sent to the Delayed Inbox contract and a ticket is created.
    
    Note that, this function forces the sender to provide a reasonable amount of funds (at least enough to submitting, and attempting to executing the ticket), but that doesn't guarantee a successful auto-redemption. [Checkout arbitrum docs for more info.](https://docs.arbitrum.io/arbos/l1-to-l2-messaging).
    
    Thank you!
    `
  const calls = [
    {
      contractAddress: inboxAddress,
      calldata: inboxCalldata,
      value: ETHDeposit.toString(),
    },
  ]

  console.log(proposalName)
  console.log(calls)

  return {
    proposalName,
    calls,
  }
}
