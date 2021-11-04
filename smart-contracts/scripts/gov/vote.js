const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getDeployment } = require('../../helpers/deployments')
const { impersonate, addUDT } = require('../../test/helpers/mainnet')

async function main({ voter, proposalId }) {
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

  // convert to uint
  // proposalId = ethers.BigNumber.from(proposalId)

  // eslint-disable-next-line no-console
  console.log(`Voter: ${voter}`)
  if (isDev) {
    await impersonate(voter)
    await addUDT(voter) // give voter some UDT
    await time.advanceBlock() // make sure proposal state is Pending > Active
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

    // success
    const { proposalId } = evt.args
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
