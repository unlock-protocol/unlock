const { run, ethers } = require('hardhat')

async function main({ proposal }) {
  const [, , voter] = await ethers.getSigners()
  const proposalId = await run('gov:submit', {
    proposal,
  })

  await run('gov:vote', {
    proposalId: `${proposalId}`,
    voter: voter.address,
    authority: true,
  })

  await run('gov:queue', {
    proposal,
    proposalId: `${proposalId}`,
  })
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
