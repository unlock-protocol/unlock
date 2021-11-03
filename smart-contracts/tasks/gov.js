const { task } = require('hardhat/config')
const { resolve } = require('path')

task('gov:submit', 'Aubmit a proposal to UDT Governor contract')
  .addParam('proposal', 'The file containing the proposal')
  .setAction(async ({ proposal }) => {
    // eslint-disable-next-line global-require
    const submitProposal = require('../scripts/gov/submit')

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const prop = require(resolve(proposal))
    return await submitProposal({ ...prop })
  })
