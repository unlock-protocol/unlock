/* eslint-disable global-require */
const { task } = require('hardhat/config')
const { resolve } = require('path')

task('gov', 'Submit (and validate) a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal: proposalPath, govAddress, params }) => {
    const { loadProposal } = require('../helpers/gov')
    const proposal = await loadProposal(resolve(proposalPath), params)
    const processProposal = require('../scripts/gov')
    return await processProposal({ proposal, govAddress })
  })

/**
 * Governor Workflow
 */
task('gov:submit', 'Submit a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal: proposalPath, govAddress, params }) => {
    const { loadProposal } = require('../helpers/gov')
    const proposal = await loadProposal(resolve(proposalPath), params)
    const submitProposal = require('../scripts/gov/submit')
    return await submitProposal({ proposal, govAddress })
  })

task('gov:vote', 'Vote for a proposal on UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalParam('voterAddress', 'The address of the voter')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .addOptionalParam(
    'proposalBlock',
    'The block when the proposal was submitted (used for voting delay in dev)'
  )
  .setAction(
    async ({
      proposal: proposalPath,
      voterAddress,
      govAddress,
      proposalBlock,
      params,
    }) => {
      const voteProposal = require('../scripts/gov/vote')
      const { loadProposal, getProposalId } = require('../helpers/gov')
      const proposal = await loadProposal(resolve(proposalPath), params)
      const proposalId =
        proposal.proposalId || (await getProposalId(proposal, govAddress))

      return await voteProposal({
        proposalId,
        voterAddress,
        govAddress,
        proposalBlock,
      })
    }
  )

task('gov:queue', 'Queue proposal in timelock')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal: proposalPath, govAddress, params }) => {
    const queueProposal = require('../scripts/gov/queue')
    const { loadProposal } = require('../helpers/gov')
    const proposal = await loadProposal(resolve(proposalPath), params)
    return await queueProposal({ proposal, govAddress })
  })

task('gov:execute', 'Closing vote period and execute a proposal (local only)')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal: proposalPath, govAddress, params }) => {
    const executeProposal = require('../scripts/gov/execute')
    const { loadProposal } = require('../helpers/gov')
    const proposal = await loadProposal(resolve(proposalPath), params)
    return await executeProposal({ proposal, govAddress, params })
  })

/**
 * Governor Utils
 */
task('gov:votes', 'Show votes for a specific proposal')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(
    async ({ proposal: proposalPath, govAddress, params }, { ethers }) => {
      const {
        getProposalVotes,
        getProposalId,
        getQuorum,
      } = require('../helpers/gov')

      const { loadProposal } = require('../helpers/gov')
      const proposal = await loadProposal(resolve(proposalPath), params)
      const proposalId =
        proposal.proposalId || (await getProposalId(proposal, govAddress))
      const { againstVotes, forVotes, abstainVotes } = await getProposalVotes(
        proposalId,
        govAddress
      )

      const quorum = await getQuorum(govAddress)
      const { formatEther } = ethers.utils

      // eslint-disable-next-line no-console
      console.log(
        `Current proposal votes 
      - against:  ${formatEther(againstVotes.toString())}
      - for: ${formatEther(forVotes.toString())}
      - abstain: ${formatEther(abstainVotes.toString())}
      - quorum: ${formatEther(quorum.toString())}`
      )
    }
  )

task('gov:state', 'Check proposal state')
  .addParam('proposalId', 'The proposal id')
  .addParam('govAddress', 'The address of the Governor contract')
  .setAction(async ({ proposalId, govAddress }) => {
    const { getProposalState } = require('../helpers/gov')

    const state = await getProposalState(proposalId, govAddress)
    // eslint-disable-next-line no-console
    console.log(`Current proposal state: ${state}`)
  })

task('gov:id', 'Retrieve proposal ID')
  .addParam('proposal', 'The file containing the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(async ({ proposal, params }) => {
    const { loadProposal } = require('../helpers/gov')
    const prop = await loadProposal(resolve(proposal), params)

    const { getProposalId } = require('../helpers/gov')
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
