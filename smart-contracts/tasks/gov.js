const { task } = require('hardhat/config')
const { resolve } = require('path')

task('gov:submit', 'Submit a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .setAction(async ({ proposal }) => {
    // eslint-disable-next-line global-require
    const submitProposal = require('../scripts/gov/submit')

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const prop = require(resolve(proposal))
    return await submitProposal({ ...prop })
  })

task('gov:vote', 'Vote for a proposal on UDT Governor contract')
  .addParam('proposalId', 'The proposal id')
  .addParam('voter', 'The address of the voter')
  .setAction(async ({ proposalId, voter }) => {
    // eslint-disable-next-line global-require
    const voteProposal = require('../scripts/gov/vote')

    return await voteProposal({ proposalId, voter })
  })

task('gov:queue', 'Queue proposal')
  .addParam('proposalId', 'The proposal id')
  .addParam('proposal', 'The file containing the proposal')
  .setAction(async ({ proposalId, proposal }) => {
    // eslint-disable-next-line global-require
    const executeProposal = require('../scripts/gov/queue')

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const prop = require(resolve(proposal))
    return await executeProposal({ proposal: prop, proposalId })
  })

task('gov:state', 'Check proposal state')
  .addParam('proposalId', 'The proposal id')
  .setAction(async ({ proposalId }) => {
    // eslint-disable-next-line global-require
    const { getProposalState } = require('../helpers/gov')

    const state = await getProposalState(proposalId)
    // eslint-disable-next-line no-console
    console.log(`Current proposal state: ${state}`)
  })
