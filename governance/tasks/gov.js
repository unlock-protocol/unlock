/* eslint-disable global-require */
const { task } = require('hardhat/config')
const { resolve } = require('path')

task('gov', 'Test execution of the entire proposal lifecycle')
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of an existing proposal')
  .addOptionalParam('txId', 'The id of the tx where the proposal was submitted')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(
    async ({
      proposal: proposalPath,
      txId,
      proposalId,
      govAddress,
      params,
    }) => {
      let proposal
      if (!proposalId) {
        const { loadProposal } = require('../helpers/gov')
        proposal = await loadProposal(resolve(proposalPath), params)
      }
      const processProposal = require('../scripts/gov')
      return await processProposal({ proposal, govAddress, proposalId, txId })
    }
  )

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
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of the already submitted proposal')
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
      proposalId,
      voterAddress,
      govAddress,
      proposalBlock,
      params,
    }) => {
      const voteProposal = require('../scripts/gov/vote')
      if (!proposalId) {
        const { loadProposal, getProposalId } = require('../helpers/gov')
        const proposal = await loadProposal(resolve(proposalPath), params)
        proposalId =
          proposal.proposalId || (await getProposalId(proposal, govAddress))
      }

      return await voteProposal({
        proposalId,
        voterAddress,
        govAddress,
        proposalBlock,
      })
    }
  )

task('gov:queue', 'Queue proposal in timelock')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of an existing proposal')
  .addOptionalParam('txId', 'The id of the tx where the proposal was submitted')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(
    async ({
      proposal: proposalPath,
      govAddress,
      params,
      proposalId,
      txId,
    }) => {
      const queueProposal = require('../scripts/gov/queue')
      let proposal
      if (!proposalId) {
        const { loadProposal } = require('../helpers/gov')
        proposal = await loadProposal(resolve(proposalPath), params)
      }
      return await queueProposal({ proposal, govAddress, proposalId, txId })
    }
  )

task('gov:execute', 'Closing vote period and execute a proposal (local only)')
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of an existing proposal')
  .addOptionalParam('txId', 'The id of the tx where the proposal was submitted')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(
    async ({
      proposal: proposalPath,
      govAddress,
      params,
      proposalId,
      txId,
    }) => {
      const executeProposal = require('../scripts/gov/execute')
      let proposal
      if (!proposalId) {
        const { loadProposal } = require('../helpers/gov')
        proposal = await loadProposal(resolve(proposalPath), params)
      }
      return await executeProposal({
        proposal,
        govAddress,
        params,
        txId,
        proposalId,
      })
    }
  )

/**
 * Governor Utils
 */
task('gov:votes', 'Show votes for a specific proposal')
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of the proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalVariadicPositionalParam(
    'params',
    'List of params to pass to the proposal function'
  )
  .setAction(
    async (
      { proposal: proposalPath, proposalId, govAddress, params },
      { ethers }
    ) => {
      const {
        getProposalVotes,
        getProposalId,
        getQuorum,
      } = require('../helpers/gov')

      if (!proposalId) {
        const { loadProposal } = require('../helpers/gov')
        const proposal = await loadProposal(resolve(proposalPath), params)
        proposalId =
          proposal.proposalId || (await getProposalId(proposal, govAddress))
      }
      const { againstVotes, forVotes, abstainVotes } = await getProposalVotes(
        proposalId,
        govAddress
      )

      const quorum = await getQuorum(govAddress)
      const { formatEther } = ethers

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
    const quorum = ethers.formatEther(q.toString())
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

task('gov:show', 'Show content of proposal')
  .addParam('govAddress', 'The address of the Governor contract')
  .addOptionalParam('proposal', 'The file containing the proposal')
  .addOptionalParam('proposalId', 'The id of an existing proposal')
  .addOptionalParam('txId', 'The id of the tx where the proposal was submitted')
  .setAction(
    async ({
      proposal: proposalPath,
      govAddress,
      params,
      proposalId,
      txId,
    }) => {
      const { loadProposal, parseProposal } = require('../helpers/gov')
      let proposal
      if (!proposalId) {
        const { loadProposal } = require('../helpers/gov')
        proposal = await loadProposal(resolve(proposalPath), params)
      } else {
        console.log('load from tx')
        proposal = await parseProposal({ txId, govAddress })
      }
      const { explainers } = proposal
      console.log(explainers)
    }
  )
