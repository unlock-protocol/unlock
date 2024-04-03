const ethers = require('ethers')
const {
  L1ToL2MessageGasEstimator,
} = require('@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator')
const { EthBridger, getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const {
  L1_RPC,
  L2_RPC,
  ARB_TOKEN_ADRESS_ON_L2,
  GRANTS_CONTRACT_ADDRESS,
  TIMELOCK_L2_ALIAS,
  L1_TIMELOCK_CONTRACT,
} = require('./constants')

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

const walletPrivateKey = process.env.PRIVATE_KEY
const l1Provider = new ethers.JsonRpcProvider(L1_RPC)
const l2Provider = new ethers.JsonRpcProvider(L2_RPC)
// const l1Wallet = new ethers.Wallet(walletPrivateKey, l1Provider)
const l2Wallet = new ethers.Wallet(walletPrivateKey, l2Provider)

module.exports = async () => {
  console.log(
    'Proposal For Executing L1 to L2 Messaging Using Arbitrum Delayed Inbox (Retryable Tickets)'
  )

  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox

  const L2TokenContract = new ethers.Contract(
    ARB_TOKEN_ADRESS_ON_L2,
    ERC20_ABI,
    l2Wallet
  ).connect(l2Wallet)

  const balanceOf = await L2TokenContract.balanceOf(TIMELOCK_L2_ALIAS)
  const tokenAmount = ethers.parseEther('1')

  // Create an instance of the Interface from the ABIs
  const erc20ContractInterface = new ethers.Interface(ERC20_ABI)
  const inboxContractInterface = new ethers.Interface(INBOX_ABI)

  // Encode the ERC20 Token transfer calldata
  const transferCalldata = erc20ContractInterface.encodeFunctionData(
    'transfer',
    [GRANTS_CONTRACT_ADDRESS, tokenAmount]
  )
  /**
   * Now we can query the required gas params using the estimateAll method in Arbitrum SDK
   */
  const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(l2Provider)

  /**
   * The estimateAll method gives us the following values for sending an L1->L2 message
   * (1) maxSubmissionCost: The maximum cost to be paid for submitting the transaction
   * (2) gasLimit: The L2 gas limit
   * (3) deposit: The total amount to deposit on L1 to cover L2 gas and L2 call value
   */
  const L1ToL2MessageGasParams = await l1ToL2MessageGasEstimate.estimateAll(
    {
      from: L1_TIMELOCK_CONTRACT,
      to: ARB_TOKEN_ADRESS_ON_L2,
      l2CallValue: 0,
      excessFeeRefundAddress: L1_TIMELOCK_CONTRACT,
      callValueRefundAddress: L1_TIMELOCK_CONTRACT,
      data: transferCalldata,
    },
    await getBaseFee(l1Provider),
    l1Provider
  )
  const gasPriceBid = await l2Provider.getGasPrice()
  const ETHDeposit = L1ToL2MessageGasParams.deposit.toNumber() * 10 // I Multiply by 10 to add extra in case gas changes due to proposal delay
  const params = [
    ARB_TOKEN_ADRESS_ON_L2, // to
    0, // l2CallValue
    L1ToL2MessageGasParams.maxSubmissionCost, // maxSubmissionCost
    L1_TIMELOCK_CONTRACT, // excessFeeRefundAddress
    L1_TIMELOCK_CONTRACT, // callValueRefundAddress
    L1ToL2MessageGasParams.gasLimit, // gasLimit
    gasPriceBid, // maxFeePerGas
    transferCalldata, // data
  ]

  const inboxCalldata = inboxContractInterface.encodeFunctionData(
    'createRetryableTicket',
    params
  )

  const proposalName = `
  # Test Transaction before 7k ARB Transfer To Fund Unlock Protocol’s Ecosystem via Grants Stack
  
  ### Goal of the proposal
   This proposal requests to use 1 ARB from the tokens given to Unlock Protocol DAO by ArbitrumDAO to run a test transaction to de-risk the transfer of 7k ARB tokens to fund the retroQF round on Grants Stack.
  
  #### Current situation of DAO's ARB Tokens
    - total: ${ethers.formatEther(balanceOf).toString()} ARB.
    - DAO ALIAS Address (On Arbitrum): [${TIMELOCK_L2_ALIAS}](https://arbiscan.io/address/${TIMELOCK_L2_ALIAS})

  For Reference
  [Snapshot temperature check for 7k ARBs](https://snapshot.org/#/unlock-protocol.eth/proposal/0xaa142e599d981f0b58c3ac1a51af9f9a52fb5307f27d791ecc18c4da69eeacc3)
  
  #### About the proposal
    The proposal contains a single call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will attempt to execute an L2 request to the ARB token contract to transfer ${ethers
      .formatEther(tokenAmount)
      .toString()} of token from the Timelock L2 Alias address \`${TIMELOCK_L2_ALIAS}\` to the [grants contract](https://arbiscan.io/address/0x00d5e0d31d37cc13c645d86410ab4cb7cb428cca) - \`transfer(${GRANTS_CONTRACT_ADDRESS},${ethers
      .formatEther(tokenAmount)
      .toString()})\`.

    Once approved and executed, the request will be sent to the Delayed Inbox contract and a ticket is created.
    
    Note that, this function forces the sender to provide a reasonable amount of funds (at least enough to submitting, and attempting to executing the ticket), but that doesn't guarantee a successful auto-redemption. [Checkout arbitrum docs for more info.](https://docs.arbitrum.io/arbos/l1-to-l2-messaging).
    
    Thank you!
    `
  // Proposal ARGS i.e Call Governor.propose() directly with these values
  const targets = [inboxAddress]
  const values = [ETHDeposit]
  const calldatas = [inboxCalldata]
  const description = proposalName

  const calls = [
    {
      contractNameOrAbi: INBOX_ABI,
      contractAddress: inboxAddress,
      functionName: 'createRetryableTicket',
      functionArgs: params,
      value: ETHDeposit,
    },
  ]

  return {
    proposalName,
    calls,
  }
}
