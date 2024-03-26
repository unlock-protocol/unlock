const ethers = require('ethers')
const {
  L1ToL2MessageGasEstimator,
} = require('@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator')
const { arbLog } = require('arb-shared-dependencies')
const {
  EthBridger,
  getL2Network,
  addDefaultLocalNetwork,
} = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')

const ERC20_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
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
const walletPrivateKey = 'Your_Private_key'
const L1RPC = 'https://mainnet.infura.io/v3/<your_infura_api_key>'
const L2RPC = 'https://arbitrum-mainnet.infura.io/v3/<your_infura_api_key>'
const l1Provider = new ethers.JsonRpcProvider(L1RPC)
const l2Provider = new ethers.JsonRpcProvider(L2RPC)
// const l1Wallet = new ethers.Wallet(walletPrivateKey, l1Provider)
const l2Wallet = new ethers.Wallet(walletPrivateKey, l2Provider)

module.exports = async () => {
  await arbLog('Cross-chain Proposer')
  addDefaultLocalNetwork()

  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox
  const ARBTokenAddressOnL2 = '0x912CE59144191C1204E64559FE8253a0e49E6548' // ARB TOKEN ADDRESS ON ARBITRUM ONE
  const grantsContractAddress = '0x00D5E0d31d37cc13C645D86410aB4cB7Cb428ccA'
  const timelockL2Alias = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c' // Timelock Alias Address on L2
  const L1TimelockContract = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B' // Timelock Address mainnet

  const L2TokenContract = new ethers.Contract(
    ARBTokenAddressOnL2,
    ERC20_ABI,
    l2Wallet
  ).connect(l2Wallet)

  const balanceOf = await L2TokenContract.balanceOf(timelockL2Alias)
  const tokenAmount = ethers.parseEther('1')

  // Create an instance of the Interface from the ABIs
  const iface_erc20 = new ethers.Interface(ERC20_ABI)
  const iface_inbox = new ethers.Interface(INBOX_ABI)

  // Encode the ERC20 Token transfer calldata
  const transfer_calldata = iface_erc20.encodeFunctionData('transfer', [
    grantsContractAddress,
    tokenAmount,
  ])
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
      from: L1TimelockContract,
      to: ARBTokenAddressOnL2,
      l2CallValue: 0,
      excessFeeRefundAddress: l2Wallet.address,
      callValueRefundAddress: l2Wallet.address,
      data: transfer_calldata,
    },
    await getBaseFee(l1Provider),
    l1Provider
  )
  const gasPriceBid = await l2Provider.getGasPrice()

  const inbox_calldata = iface_inbox.encodeFunctionData(
    'createRetryableTicket',
    [
      ARBTokenAddressOnL2,
      0,
      L1ToL2MessageGasParams.maxSubmissionCost,
      l2Wallet.address,
      l2Wallet.address,
      L1ToL2MessageGasParams.gasLimit,
      gasPriceBid,
      transfer_calldata,
    ]
  )

  const proposalName = `# Test Transaction before 7k ARB Transfer To Fund Unlock Protocol’s Ecosystem via Grants Stack  This proposal requests to use 1 ARB from the tokens given to Unlock Protocol DAO by ArbitrumDAO to run a test transaction to de-risk the transfer of 7k ARB tokens to fund the retroQF round on Grants Stack.`
  // Proposal ARGS i.e Call Governor.propose() directly with these values
  const targets = [inboxAddress]
  const values = [L1ToL2MessageGasParams.deposit.toNumber() * 10] // I Multiply by 10 to add extra in case gas changes
  const calldatas = [inbox_calldata]
  const description = proposalName

  const calls = [
    {
      contractNameOrAbi: INBOX_ABI,
      contractAddress: inboxAddress,
      functionName: 'createRetryableTicket',
      functionArgs: [
        ARBTokenAddressOnL2,
        0,
        L1ToL2MessageGasParams.maxSubmissionCost,
        l2Wallet.address,
        l2Wallet.address,
        L1ToL2MessageGasParams.gasLimit,
        gasPriceBid,
        transfer_calldata,
      ],
      value: L1ToL2MessageGasParams.deposit.toNumber() * 10, // I Multiply by 10 to add extra in case gas changes due to proposal delay
    },
  ]

  return {
    proposalName,
    calls,
  }
}
