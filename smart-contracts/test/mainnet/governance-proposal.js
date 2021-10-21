const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { resetState, impersonate } = require('../helpers/mainnet')

const UnlockDiscountTokenV2 = artifacts.require('UnlockDiscountTokenV2.sol')
const UnlockProtocolGovernor = artifacts.require('UnlockProtocolGovernor.sol')

/**
 * We are testing a full flow from a mainnet fork
 * 1. We assign some tokens from an address to the governance contract
 * 2. A new proposal is created to send these tokens somewhere else
 * 3. Governors are voting
 * 4. Proposal gets sent to timelock
 * 5. Proposal gets executed
 * 6. Verify that tokens were transfered
 */

const teamWalletAddress = '0xE5Cd62AC8d2Ca2A62a04958f07Dd239c1Ffe1a9E'
const proposerAddress = '0x9d3ea9e9adde71141f4534db3b9b80df3d03ee5f'
const votersAddresses = [
  teamWalletAddress,
  '0x0d8410643ae7a4d833c7219e5c6fadfa5ce912cd',
  '0xde22de740609532fc0f48287b7f258776be814fd',
  '0xddf767f258adf0af89896621349cadcf8722f771',
  '0x6aec5228fda60525f59afc773ada7df6a6d8e43f',
  '0xbc12fd3c9679b36631af3351f9e9c908e179d0e7',
  '0xaa759dfffb47c0c6093ffa082fe7dab91adf5fea',
  '0xbccf3780cd5efe5cd73321dcbb86fecfda7d3d7e',
  '0x726cdc837384a7deb8bbea64beba2e7b4d7346c0',
  '0x42881a8477279e018ec7fe0a54236a9c63438118',
  '0x8c0a4d4381c651206cf974ab3ec5ee1153fce9d2',
  '0x0ec462f19a065fd401b115e922556de45cad9657',
  '0x512802fffabb4c4a3f681e41ce237ec2cbb19d82',
  '0xc57e365353117e477e25937444cd2f14d72f6058',
  '0xef7ebd9ddf0314af4446108bcbcd4ae88e70329b',
  '0x8e2fd397892e80beb850ef9b2aacb7920c9b5134',
]
const udtContractAddress = '0x90de74265a416e1393a450752175aed98fe11517'
const governanceContractAddress = '0x7757f7f21f5fa9b1fd168642b79416051cd0bb94'
const timelockContractAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'
const tokenRecipientAddress = '0x8d533d1A48b0D5ddDEF513A0B0a3677E991F3915' // ramdomly generated

/**
 * Delegates top holders to delegate so that when delegate votes, enough weight is added
 * @param {*} tokenHolders
 * @param {*} delegate
 */
const delegateAll = async (tokenHolders, delegate) => {
  // Let's have all voters delegate!
  // eslint-disable-next-line no-restricted-syntax
  for await (const holderAddress of tokenHolders) {
    // eslint-disable-next-line no-console
    console.log(`${holderAddress} delegate to ${delegate}`)
    await impersonate(holderAddress)
    const voterWallet = await ethers.getSigner(holderAddress)
    const udt = await new ethers.Contract(
      udtContractAddress,
      UnlockDiscountTokenV2.abi,
      voterWallet
    )
    await udt.delegate(delegate)
  }
}

/**
 * Submits a proposal
 * @param {*} proposerAddress
 * @param {*} proposal
 * @returns
 */
const submitProposal = async (proposerAddress, proposal) => {
  await impersonate(proposerAddress)
  const proposerWallet = await ethers.getSigner(proposerAddress)

  const gov = await new ethers.Contract(
    governanceContractAddress,
    UnlockProtocolGovernor.abi,
    proposerWallet
  )

  const proposalTx = await gov.propose(...proposal)

  const { events } = await proposalTx.wait()
  const evt = events.find((v) => v.event === 'ProposalCreated')
  const { proposalId } = evt.args

  await time.advanceBlock()

  console.log('proposal submitted', proposalId)
  return proposalId
}

/**
 * Make an address vote for a proposal
 * @param {*} voterAddress
 * @param {*} proposalId
 */
const vote = async (voterAddress, proposalId) => {
  await impersonate(voterAddress)
  const voterWallet = await ethers.getSigner(voterAddress)
  const governanceForVoter = await new ethers.Contract(
    governanceContractAddress,
    UnlockProtocolGovernor.abi,
    voterWallet
  )
  const state = await governanceForVoter.state(proposalId)
  if (state < 2) {
    console.log(`${voterAddress} approves (votes 1)`)
    await governanceForVoter.castVote(proposalId, 1)
  }
}

/**
 * Finishes the voting period!
 * @param {*} proposalId
 */
const finishVotes = async (proposalId) => {
  const gov = await new ethers.Contract(
    governanceContractAddress,
    UnlockProtocolGovernor.abi,
    ethers.provider
  )

  const deadline = await gov.proposalDeadline(proposalId)
  const currentBlock = await ethers.provider.getBlockNumber()
  if (currentBlock < deadline) {
    console.log('advancing to deadline at block #', deadline.toNumber())
    await time.advanceBlockTo(deadline.toNumber())
  }
}

/**
 * Queues a proposal
 * @param {*} proposerAddress
 * @param {*} proposal
 */
const queueProposal = async (proposerAddress, proposalId, proposal) => {
  const [targets, values, calldatas, description] = proposal
  const descriptionHash = web3.utils.keccak256(description)
  const voterWallet = await ethers.getSigner(proposerAddress)
  const gov = await new ethers.Contract(
    governanceContractAddress,
    UnlockProtocolGovernor.abi,
    voterWallet
  )
  const state = await gov.state(proposalId)
  if (state === 5) {
    const eta = await gov.proposalEta(proposalId)
    return eta
  }
  const tx = await gov.queue(targets, values, calldatas, descriptionHash)
  const { events } = await tx.wait()
  const evt = events.find((v) => v.event === 'ProposalQueued')
  const { eta } = evt.args
  return eta.toNumber()
}
/**
 * Executes a proposal
 * @param {*} proposerAddress
 * @param {*} proposal
 */
const executeProposal = async (executorAddress, proposal, timestamp) => {
  const [targets, values, calldatas] = proposal
  const descriptionHash = web3.utils.keccak256(proposal.slice(-1).find(Boolean))

  const executerWallet = await ethers.getSigner(executorAddress)
  const gov = await new ethers.Contract(
    governanceContractAddress,
    UnlockProtocolGovernor.abi,
    executerWallet
  )

  const currentTime = (await time.latest()).toNumber()
  if (currentTime < timestamp) {
    await time.increaseTo(timestamp + 1)
  }
  await gov.execute(targets, values, calldatas, descriptionHash, {
    gasLimit: '1000000',
  })
}

/**
 * Set state for pre-requisites to governance decision, should be customized for every proposal
 */
const prerequisites = async () => {
  // Impersonate team wallet
  await impersonate(teamWalletAddress)
  const teamWallet = await ethers.getSigner(teamWalletAddress)
  const udt = await new ethers.Contract(
    udtContractAddress,
    UnlockDiscountTokenV2.abi,
    teamWallet
  )

  // Transfer 1 UDT from team's wallet to governance
  await udt.transfer(timelockContractAddress, ethers.utils.parseUnits('1', 18))
}

/**
 * This can be customized for every proposal!
 * @returns
 */
const buildProposal = async () => {
  const udt = await new ethers.Contract(
    udtContractAddress,
    UnlockDiscountTokenV2.abi
  )

  const transferCalldata = udt.interface.encodeFunctionData('transfer', [
    tokenRecipientAddress,
    ethers.utils.parseUnits('0.01', 18),
  ])

  return [
    [udtContractAddress], // proposal is sent to UDT contract
    [0], // no value
    [transferCalldata],
    'Proposal #1: Give grant to someone',
  ]
}

describe('Governance', () => {
  before(async () => {
    if (!process.env.RUN_MAINNET_FORK) {
      // all suite will be skipped
      this.skip()
    }

    const udt = await new ethers.Contract(
      udtContractAddress,
      UnlockDiscountTokenV2.abi,
      ethers.provider
    )

    // Reset the node
    await resetState()

    // Run prerequisites
    await prerequisites()

    console.log(
      'TIMELOCK CONTRACT BEFORE:',
      ethers.utils.formatUnits(await udt.balanceOf(timelockContractAddress), 18)
    )
    console.log(
      'RECIPIENT BEFORE:',
      ethers.utils.formatUnits(await udt.balanceOf(tokenRecipientAddress), 18)
    )

    const gov = await new ethers.Contract(
      governanceContractAddress,
      UnlockProtocolGovernor.abi,
      ethers.provider
    )

    await delegateAll(votersAddresses, votersAddresses[0])

    // Build proposal
    const proposal = await buildProposal()

    // Then, submit a proposal to transfer these tokens to another address!
    const proposalId = await submitProposal(proposerAddress, proposal)

    // Let's now have the delagate vote!
    await vote(votersAddresses[0], proposalId)

    // Finish voting period
    await finishVotes(proposalId)

    const eta = await queueProposal(votersAddresses[0], proposalId, proposal)

    // execute the proposal
    await executeProposal(votersAddresses[0], proposal, eta)
    console.log('proposal state (7 expected)', await gov.state(proposalId))
    assert.equal(await gov.state(proposalId), 7) // Executed
    console.log(
      'TIMELOCK CONTRACT AFTER:',
      ethers.utils.formatUnits(await udt.balanceOf(timelockContractAddress), 18)
    )
    console.log(
      'RECIPIENT AFTER:',
      ethers.utils.formatUnits(await udt.balanceOf(tokenRecipientAddress), 18)
    )
  })

  it('should work', () => {
    expect(true)
  })
})
