const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getDeployment } = require('../../helpers/deployments')
const { getProposalState } = require('../../helpers/gov')
const { impersonate, getDictator } = require('../../test/helpers/mainnet')

async function main({ voter, proposalId }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  if (!proposalId) {
    throw new Error('GOV VOTE > Missing proposal ID.')
  }
  if (!voter && !isDev) {
    throw new Error(
      'GOV VOTE > Cast vote w/o voter (authoritarian mode) can only be used on dev network.'
    )
  }

  // eslint-disable-next-line no-console
  console.log(`GOV VOTE > proposal ID : ${proposalId}`)

  if (isDev) {
    if (!voter) {
      // No voter equals to authoritarian mode: a single voter win!
      const [, , localDictator] = await ethers.getSigners()
      const dictator = process.env.RUN_MAINNET_FORK
        ? await getDictator()
        : localDictator

      voter = dictator.address
      // eslint-disable-next-line no-console
      console.log(`GOV VOTE (dev) > Authoritarian mode : ${dictator.address}`)
    }
    await impersonate(voter)
    // make sure proposal state is active
    const state = await getProposalState(proposalId)
    if (state === 'Pending') {
      // wait for a block (default voting delay)
      const currentBlock = await ethers.provider.getBlockNumber()
      await time.advanceBlockTo(currentBlock + 2)
    }
  }

  const voterWallet = await ethers.getSigner(voter)
  const { address, abi } = getDeployment(chainId, 'UnlockProtocolGovernor')
  const gov = await ethers.getContractAt(abi, address)

  const currentBlock = await ethers.provider.getBlockNumber()
  // eslint-disable-next-line no-console
  console.log(
    'GOV VOTE >',
    `voter ${voter}: power ${ethers.utils.formatUnits(
      await gov.getVotes(voter, currentBlock - 1),
      18
    )} `,
    `(quorum ${ethers.utils.formatUnits(
      await gov.quorum(currentBlock - 1),
      18
    )})`
  )
  const state = await getProposalState(proposalId)
  if (state === 'Active') {
    const hasVoted = await gov.hasVoted(proposalId, voter)
    if (hasVoted) {
      // eslint-disable-next-line no-console
      console.log('GOV VOTE > voter already voted')
      return
    }

    const tx = await gov.connect(voterWallet).castVote(proposalId, '1')
    const { events, transactionHash } = await tx.wait()
    const evt = events.find((v) => v.event === 'VoteCast')

    // double check vote happened
    const hasVotedAfter = await gov.hasVoted(proposalId, voter)

    // check for failure
    if (!evt || !hasVotedAfter) {
      throw new Error('GOV VOTE > Vote not casted.')
    }
    // eslint-disable-next-line no-console
    console.log(
      `GOV VOTE > vote casted: ${voter} approves (weigth: ${evt.args.weight.toString()}) (txid: ${transactionHash})`
    )
  } else {
    throw new Error(`GOV VOTE > Proposal state (${state}) does not allow vote.`)
  }
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
