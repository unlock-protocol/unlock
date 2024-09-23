const ethers = require('ethers')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { EthBridger, getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')

const GRANTS_CONTRACT_ADDRESS = '0x00D5E0d31d37cc13C645D86410aB4cB7Cb428ccA' // Grants contract on Arbitrum
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

module.exports = async ({
  tokenAddressL2 = ARB_TOKEN_ADRESS_ON_L2,
  fromL1 = L1_TIMELOCK_CONTRACT,
  toL2 = GRANTS_CONTRACT_ADDRESS,
  fromL2 = TIMELOCK_L2_ALIAS,
}) => {
  console.log(
    'Proposal For Executing L1 to L2 Messaging Using Arbitrum Delayed Inbox (Retryable Tickets)'
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
  const tokenAmount = ethers.utils.parseUnits('8200', decimals)

  // Create an instance of the Interface from the ABIs
  const erc20ContractInterface = new ethers.utils.Interface(ERC20_ABI)
  const inboxContractInterface = new ethers.utils.Interface(INBOX_ABI)

  // Encode the ERC20 Token transfer calldata
  const transferCalldata = erc20ContractInterface.encodeFunctionData(
    'transfer',
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
  # Transfer 8200 ARB To Fund Unlock Protocol’s Ecosystem via Grants Stack
  
  ### Goal of the proposal
   This proposal requests to use 8200 ARB from the tokens given to Unlock Protocol DAO by ArbitrumDAO to fund the retroQF round on Grants Stack for projects building on Unlock Protocol.
  
  #### Current situation of DAO's ARB Tokens
    - total: ${ethers.utils.formatUnits(balanceOf, decimals).toString()} ARB.
    - DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})

  For Reference
  [Snapshot temperature check for Retro QF Grants Round](https://snapshot.org/#/unlock-protocol.eth/proposal/0xaa142e599d981f0b58c3ac1a51af9f9a52fb5307f27d791ecc18c4da69eeacc3)
  
  In addition to the 7k ARB tokens requested for funding Unlock Ecosystem projects, an extra 1200 ARB is requested for compensation for the round management according to the following breakdown:
  
  7000 ARB - Matching fund
  700 ARB (10%) of matching fund to the round manager - lanadingwall.eth
  500 ARB for research and technical assistance - dannithomx.eth  
  Total: 8200 ARB

  [Snapshot temperature check for 8200 ARBs](https://snapshot.org/#/unlock-protocol.eth/proposal/0x4fa320e553e6992506cd31d7c0b2013e1548c646baba02d657f3a7b198140c25)
  
  #### About the proposal
    The proposal contains a single call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will attempt to execute an L2 request to the ARB token contract to transfer ${ethers.utils
      .formatUnits(tokenAmount, decimals)
      .toString()} of token from the Timelock L2 Alias address \`${fromL2}\` to the [grants contract](https://arbiscan.io/address/0x00d5e0d31d37cc13c645d86410ab4cb7cb428cca) - \`transfer(${toL2},${ethers.utils
      .formatUnits(tokenAmount, decimals)
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
