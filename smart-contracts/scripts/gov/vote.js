const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getDeployment } = require('../../helpers/deployments')
const { getProposalState } = require('../../helpers/gov')
const { impersonate, addUDT } = require('../../test/helpers/mainnet')

async function main({ voter, proposalId, authority }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  // eslint-disable-next-line no-console
  if (isDev) console.log('Dev mode ON')

  if (!voter) {
    // eslint-disable-next-line no-console
    throw new Error('GOV VOTE > Missing voter address.')
  }
  if (!proposalId) {
    // eslint-disable-next-line no-console
    throw new Error('GOV VOTE > Missing proposal ID.')
  }
  if (authority && !isDev) {
    // eslint-disable-next-line no-console
    throw new Error(
      'GOV VOTE > The authority flag can only be used on dev network.'
    )
  }

  if (isDev) {
    await impersonate(voter)
    // make sure proposal state is active
    const state = await getProposalState(proposalId)
    if (state === 'Pending') {
      await time.advanceBlock()
    }

    if (authority) {
      // let's reach concensus
      const quorum = 15000 // 15k UDT hardcoded in contract
      const [, holder] = await ethers.getSigners()

      // give twice the quorum in UDT
      await addUDT(holder.address, quorum * 2)
      const { address: udtAddress, abi: udtAbi } = getDeployment(
        chainId,
        'UnlockDiscountTokenV2'
      )
      const udt = await new ethers.Contract(udtAddress, udtAbi, holder)

      const tx = await udt.delegate(voter)
      const { events } = await tx.wait()
      const evt = events.find((v) => v.event === 'DelegateVotesChanged')
      if (evt) {
        // eslint-disable-next-line no-console
        console.log('GOV VOTE (dev) > delegated quorum to voter')
      }
      await time.advanceBlock()
    }
  }

  const voterWallet = await ethers.getSigner(voter)
  const { address, abi } = getDeployment(chainId, 'UnlockProtocolGovernor')
  const gov = await ethers.getContractAt(abi, address)

  const state = await gov.state(proposalId)
  if (state === 1) {
    const tx = await gov.connect(voterWallet).castVote(proposalId, '1')
    const { events, transactionHash } = await tx.wait()

    // console.log(await gov.state(proposalId))
    const evt = events.find((v) => v.event === 'VoteCast')

    // check for failure
    if (!evt) {
      throw new Error('GOV VOTE > Vote not casted.')
    }

    // eslint-disable-next-line no-console
    console.log(
      `vote casted: ${voter} approves (votes 1) (txid: ${transactionHash})`
    )
  } else {
    throw new Error(`GOV VOTE > Proposal state (${state}) does not allow vote.`)
  }
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
