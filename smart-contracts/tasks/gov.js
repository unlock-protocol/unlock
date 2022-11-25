/* eslint-disable global-require */
const { task } = require('hardhat/config')
const { resolve } = require('path')

task('gov', 'Submit (and validate) a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal, govAddress }) => {
    const processProposal = require('../scripts/gov')
    return await processProposal({ proposal, govAddress })
  })

/**
 * Governor Workflow
 */
task('gov:submit', 'Submit a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal, govAddress }) => {
    const submitProposal = require('../scripts/gov/submit')

    const prop = require(resolve(proposal))
    return await submitProposal({ ...prop, govAddress })
  })

task('gov:vote', 'Vote for a proposal on UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalParam('voter', 'The address of the voter')
  .setAction(async ({ proposal: proposalPath, voter, govAddress }) => {
    const voteProposal = require('../scripts/gov/vote')
    const { getProposalId } = require('../helpers/gov')

    const proposal = require(resolve(proposalPath))
    const proposalId =
      proposal.proposalId || (await getProposalId(proposal, govAddress))

    return await voteProposal({ proposalId, voter, govAddress })
  })

task('gov:queue', 'Queue proposal in timelock')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal: proposalPath, govAddress }) => {
    const queueProposal = require('../scripts/gov/queue')
    const proposal = require(resolve(proposalPath))
    return await queueProposal({ proposal, govAddress })
  })

task('gov:execute', 'Closing vote period and execute a proposal (local only)')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal: proposalPath, govAddress }) => {
    const executeProposal = require('../scripts/gov/execute')
    const proposal = require(resolve(proposalPath))
    return await executeProposal({ proposal, govAddress })
  })

/**
 * Governor Utils
 */
task('gov:votes', 'Show votes for a specific proposal')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal: proposalPath, govAddress }, { ethers }) => {
    const {
      getProposalVotes,
      getProposalId,
      getQuorum,
    } = require('../helpers/gov')

    const proposal = require(resolve(proposalPath))

    const proposalId =
      proposal.proposalId || (await getProposalId(proposal, govAddress))
    const { againstVotes, forVotes, abstainVotes } = await getProposalVotes(
      proposalId,
      govAddress
    )

    const quorum = await getQuorum({ govAddress })
    const { formatEther } = ethers.utils

    // eslint-disable-next-line no-console
    console.log(
      `Current proposal votes 
      - against:  ${formatEther(againstVotes.toString())}
      - for: ${formatEther(forVotes.toString())}
      - abstain: ${formatEther(abstainVotes.toString())}
      - quorum: ${formatEther(quorum.toString())}`
    )
  })

task('gov:state', 'Check proposal state')
  .addParam('proposalId', 'The proposal id')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposalId }) => {
    const { getProposalState } = require('../helpers/gov')

    const state = await getProposalState(proposalId)
    // eslint-disable-next-line no-console
    console.log(`Current proposal state: ${state}`)
  })

task('gov:id', 'Retrieve proposal ID')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposal }) => {
    const { getProposalId } = require('../helpers/gov')

    const prop = require(resolve(proposal))
    const proposalId = await getProposalId(prop)

    // eslint-disable-next-line no-console
    console.log(`Proposal id: ${proposalId}`)
  })

task('gov:quorum', 'Retrieve current quorum')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ govAddress }, { ethers }) => {
    const { getQuorum } = require('../helpers/gov')
    const q = await getQuorum(govAddress)
    const quorum = ethers.utils.formatEther(q.toString())
    // eslint-disable-next-line no-console
    console.log(`GOV > quorum: ${quorum} UDT`)

    return quorum
  })

task('gov:delegate', 'Delagate voting power')
  .addParam('delegate', 'The delegate receving the voting power')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalParam('holder', 'The holder address')
  .setAction(async ({ delegate, holder, govAddress }) => {
    const delegateVote = require('../scripts/gov/delegate')

    return await delegateVote({
      delegateAddress: delegate,
      holderAddress: holder,
      govAddress,
    })
  })
