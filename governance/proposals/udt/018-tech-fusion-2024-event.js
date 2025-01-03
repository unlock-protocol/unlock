const ethers = require('ethers')
const { ParentToChildMessageGasEstimator } = require('@arbitrum/sdk')
const { EthBridger, getL2Network } = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
const { mainnet, arbitrum } = require('@unlock-protocol/networks')

const GRANTS_CONTRACT_ADDRESS = '0xD2BC5cb641aE6f7A880c3dD5Aee0450b5210BE23' // Receiving Address on Arbitrum
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
  console.log('Proposal For TechFusion 2024 Event')

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
  const tokenToReceive = '373'
  const tokenAmount = ethers.parseUnits(tokenToReceive, decimals)

  // Create an instance of the Interface from the ABIs
  const erc20ContractInterface = new ethers.Interface(ERC20_ABI)
  const inboxContractInterface = new ethers.Interface(INBOX_ABI)

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
    L1ToL2MessageGasParams.maxSubmissionCost.toString() * 10, // maxSubmissionCost: I Multiply by 10 to add extra in case gas changes due to proposal delay
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
  # Transfer 373 ARB To Fund TechFusion 2024 Event  
  
  ### Background  
   We are very excited to organize this event with a new emerging community called ComunDAO3600, as we aim to become a DAO dedicated to supporting Bolivian projects. Our event, TechFusion, seeks to bring together hundreds of people interested in exploring synergies between AI and blockchain, fostering a continuous learning environment and business opportunities.
  The goal is to gather students, experts, and entrepreneurs to explore the intersections between Artificial Intelligence (AI), Blockchain, and Cryptocurrencies. We aim to encourage hands-on learning, discussions about emerging innovations, and networking among participants.
  The target audience for TechFusion includes:
  Technology Professionals: Developers, software engineers, and AI and blockchain experts looking to stay updated on the latest trends.
  Entrepreneurs and Startups: Founders and teams interested in applying blockchain or AI to enhance their products or services.
  Investors and Financial Analysts: Those looking to gain a better understanding of investment opportunities in cryptocurrencies and emerging technologies.
  Students and Academics: Young professionals and students interested in developing skills in AI, blockchain, and cryptocurrencies.
  Technology Enthusiasts: Curious individuals who want to learn and explore the future of these disruptive technologies.  
  The Ticket: https://app.unlock-protocol.com/event/tech-fusion-2024  
  
  #### Benefits  
  By involving the DAO in my activities, key opportunities will be created for:
  Visibility and positioning: The DAO will be directly associated with events that highlight technological innovation, increasing its recognition within the crypto and blockchain ecosystem.
  Talent attraction: Through conferences and workshops, we will attract developers, researchers, and entrepreneurs who can join the DAO as active members or collaborators.
  Community expansion: These events will attract new users and participants who align with the DAO's values and objectives, creating a stronger user base.
  Collaboration opportunities: The events will facilitate the creation of strategic partnerships with related projects and organizations.  

  #### Risks  
  As with any growth initiative, there are certain risks, although I believe they are manageable:
  Reputation: While I always strive to maintain high standards of quality in the events, there is a risk that a speaker or collaborator might not meet expectations, which could reflect negatively on the DAO. However, to mitigate this, I carefully select speakers and collaborators.
  Low short-term return on investment: Tangible benefits, such as new collaborations or adoptions, may not be immediate, as building strong communities takes time.  
  
  #### Timeline and Implementation
  1 - Get Snapshot approval from the DAO for the overall idea.
  2 - Generate event Ticket
  3 - Pre-TechFusion November 2024 (online): Event focused on the intersection of AI and Blockchain. (Dates: November 13 - 20).
  4 - TechFusion November 2024 (in-person): A more interactive event focusing on networking and knowledge sharing. (November 22, 2024).
  Total timeline is 2 weeks  
  
  #### Resources  
  Quoted in ARB token eq 250 usdc  
  Printed materials:  

  Protocol merchandise  
  75 ARB  
  Venue rental and technical equipment:  
  149.25 ARB  
  Marketing, design, and promotion:  
  149.25 ARB  
  Total: 373.5 ARB  
  price ARB token $0.67  
  
  Wallet address as a recipient: *0xD2BC5cb641aE6f7A880c3dD5Aee0450b5210BE23*  
  Due to time and the urgent need to cover organizational costs, Stella Achenbach has provided the requested funds in USDC, so she will be receiving the ARB tokens.
  Here is the [transaction hash](https://basescan.org/tx/0x9e235555a513c3bfa62f622e24a7ad96a8701b0d8040c5888b74e028337d1c0f)  
  The exchange value in ARB which is $0.67, should be equivalent to 250 USDC  
  approximately 373.13 ARB  

  For Reference  
  [Snapshot temperature check for TechFusion 2024 Event](https://snapshot.org/#/unlock-dao.eth/proposal/0x55b493884276233c411d2bc58e64efc7f2303b6c5ca9efe8f162a584af3e0ac2)  
  
  #### Current situation of DAO's ARB Tokens  
    - total: ${ethers.formatUnits(balanceOf, decimals).toString()} ARB.
    - DAO ALIAS Address (On Arbitrum): [${fromL2}](https://arbiscan.io/address/${fromL2})


  #### About the proposal
    The proposal contains a single call to the Arbitrum Delayed Inbox Contract's \`createRetryableTicket\` function on mainnet to create a \`Retryable Ticket\` that will attempt to execute an L2 request to the ARB token contract to transfer ${ethers
      .formatUnits(tokenAmount, decimals)
      .toString()} of token from the Timelock L2 Alias address \`${fromL2}\` to the [grants contract](https://arbiscan.io/address/0x00d5e0d31d37cc13c645d86410ab4cb7cb428cca) - \`transfer(${toL2},${ethers
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
