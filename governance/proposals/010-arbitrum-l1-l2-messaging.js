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

const ERC20_ABI = require('../helpers/abi/erc20-abi.json')
const INBOX_ABI = require('../helpers/abi/inbox-abi.json')

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.DEVNET_PRIVKEY
const l1Provider = new ethers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new ethers.JsonRpcProvider(process.env.L2RPC)
const l1Wallet = new ethers.Wallet(walletPrivateKey, l1Provider)
const l2Wallet = new ethers.Wallet(walletPrivateKey, l2Provider)

module.exports = async () => {
  await arbLog('Cross-chain Proposer')
  addDefaultLocalNetwork()

  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox
  const ARBTokenAddressOnL2 = '0x912CE59144191C1204E64559FE8253a0e49E6548' // ARB TOKEN ADDRESS ON ARBITRUM ONE
  const grantsContractAddress = '0x00D5E0d31d37cc13C645D86410aB4cB7Cb428ccA'
  const L2Alias = '0x28ffDfB0A6e6E06E95B3A1f928Dc4024240bD87c' // Timelock Alias Address on L2
  const L1TimelockContract = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B' // Timelock Address mainnet

  const L2TokenContract = new ethers.Contract(
    ARBTokenAddressOnL2,
    ERC20_ABI.abi,
    l2Wallet
  ).connect(l2Wallet)

  const balanceOf = await L2TokenContract.balanceOf(L2Alias)
  console.log('ARB BALANCE::', ethers.formatEther(await balanceOf))

  const tokenAmount = ethers.parseEther('1')

  // Create an instance of the Interface from the ABIs
  const iface_erc20 = new ethers.Interface(ERC20_ABI.abi)
  const iface_inbox = new ethers.Interface(INBOX_ABI.abi)

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
  console.log(':::::::::L1ToL2MessageGasParams::::::::::')
  console.log(
    'GasParams::::gasLimit',
    L1ToL2MessageGasParams.gasLimit.toNumber()
  )
  console.log(
    'GasParams::::maxSubmissionCost',
    L1ToL2MessageGasParams.maxSubmissionCost.toNumber()
  )
  console.log(
    'GasParams::::maxGas',
    L1ToL2MessageGasParams.maxFeePerGas.toNumber()
  )
  console.log('GasParams::::deposit', L1ToL2MessageGasParams.deposit.toNumber())

  console.log(
    `Current retryable base submission price is: ${L1ToL2MessageGasParams.maxSubmissionCost.toString()}`
  )

  const gasPriceBid = await l2Provider.getGasPrice()
  console.log(`L2 gas price: ${gasPriceBid.toString()}`)

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
  console.log(proposalName)
  // Proposal ARGS i.e Call Governor.propose() directly with these values
  // targets: Inbox contract
  // values: depost * 10
  // calldatas: inbox_calldata
  // description
  const targets = [inboxAddress]
  const values = [L1ToL2MessageGasParams.deposit.toNumber() * 10] // I Multiply by 10 to add extra in case gas changes
  const calldatas = [inbox_calldata]
  console.log(
    '______________________________________________________________________\n'
  )
  console.log(
    'PROPOSAL ARGS - Can Call Propose function on Governor with the following::'
  )
  console.log(
    '______________________________________________________________________\n'
  )

  console.log('TARGETS:: ', targets)
  console.log('VALUES:: ', values)
  console.log('CALLDATAS:: ', calldatas)
  console.log('DESCRIPTION:: ', proposalName)

  const calls = [
    {
      contractNameOrAbi: INBOX_ABI.abi,
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
