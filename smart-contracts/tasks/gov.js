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
