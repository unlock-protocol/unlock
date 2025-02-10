const ethers = require('ethers')
const {
  ParentToChildMessageGasEstimator,
  ParentTransactionReceipt,
} = require('@arbitrum/sdk')
const { EthBridger, getArbitrumNetwork } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')

const GRANTS_CONTRACT_ADDRESS = '0x00D5E0d31d37cc13C645D86410aB4cB7Cb428ccA' // Grants contract on Arbitrum
const TIMELOCK_L2_ALIAS = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c' // Timelock Alias Address on L2
const L1_TIMELOCK_CONTRACT = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B' // Timelock Address on mainnet

// ARB Token Address on Arbitrum One
const { address: ARB_TOKEN_ADDRESS_ON_L2 } = arbitrum.tokens.find(
  ({ symbol }) => symbol === 'ARB'
)
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')
const INBOX_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'l2CallValue', type: 'uint256' },
      { internalType: 'uint256', name: 'maxSubmissionCost', type: 'uint256' },
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
      { internalType: 'uint256', name: 'gasLimit', type: 'uint256' },
      { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'createRetryableTicket',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
]

const l1Provider = new ethers.JsonRpcProvider(mainnet.provider)
const l2Provider = new ethers.JsonRpcProvider(arbitrum.provider)

module.exports = async ({
  tokenAddressL2 = ARB_TOKEN_ADDRESS_ON_L2,
  fromL1 = L1_TIMELOCK_CONTRACT,
  toL2 = GRANTS_CONTRACT_ADDRESS,
  fromL2 = TIMELOCK_L2_ALIAS,
}) => {
  console.log(
    'Proposal For Executing L1 to L2 Messaging Using Arbitrum Delayed Inbox (Retryable Tickets)'
  )

  const l2Network = await getArbitrumNetwork(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.childNetwork.ethBridge.inbox

  const L2TokenContract = new ethers.Contract(
    tokenAddressL2,
    ERC20_ABI,
    l2Provider
  )
  const decimals = await L2TokenContract.decimals()
  const balanceOf = await L2TokenContract.balanceOf(fromL2)
  const tokenAmount = ethers.utils.parseUnits('8200', decimals)

  const erc20ContractInterface = new ethers.utils.Interface(ERC20_ABI)
  const inboxContractInterface = new ethers.utils.Interface(INBOX_ABI)

  const transferCalldata = erc20ContractInterface.encodeFunctionData(
    'transfer',
    [toL2, tokenAmount]
  )

  const gasEstimator = new ParentToChildMessageGasEstimator(l2Provider)
  const gasEstimateParams = {
    from: fromL1,
    to: tokenAddressL2,
    l2CallValue: 0,
    excessFeeRefundAddress: fromL1,
    callValueRefundAddress: fromL1,
    data: transferCalldata,
  }

  const gasEstimates = await gasEstimator.estimateAll(
    gasEstimateParams,
    await getBaseFee(l1Provider),
    l1Provider
  )

  const gasPriceBid = await l2Provider.getGasPrice()
  const ETHDeposit = gasEstimates.deposit.toNumber() * 10 // Multiply by 10 to add buffer for fee changes before proposal is executed

  const retryableTicketParams = [
    gasEstimateParams.to,
    gasEstimateParams.l2CallValue,
    (gasEstimates.maxSubmissionCost.toNumber() * 10).toString(), // Multiply by 10 to add buffer for fee changes before proposal is executed
    gasEstimateParams.excessFeeRefundAddress,
    gasEstimateParams.callValueRefundAddress,
    gasEstimates.gasLimit.toString(),
    gasPriceBid.toString(),
    gasEstimateParams.data,
  ]

  const inboxCalldata = inboxContractInterface.encodeFunctionData(
    'createRetryableTicket',
    retryableTicketParams
  )

  const proposalName = `
    # Transfer 8200 ARB to Unlock Protocol DAO's Ecosystem Grants Stack

    This proposal includes creating a retryable ticket to transfer ${ethers.utils.formatUnits(
      tokenAmount,
      decimals
    )} ARB from the L2 Timelock Alias to the Grants Contract.
  `

  const targets = [inboxAddress]
  const values = [ETHDeposit.toString()]
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
