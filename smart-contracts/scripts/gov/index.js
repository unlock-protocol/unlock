const { run, ethers, network } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { getDeployment } = require('../../helpers/deployments')
const { addUDT, getDictator } = require('../../test/helpers/mainnet')
const submit = require('./submit')
const vote = require('./vote')
const queue = require('./queue')
const execute = require('./queue')

async function main({ proposal }) {
  const [, holder, localDictator] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  const quorum = await run('gov:quorum')
  const dictator = process.env.RUN_MAINNET_FORK
    ? localDictator
    : await getDictator()

  // lower voting period on mainnet
  if (chainId === 31337 || process.env.RUN_MAINNET_FORK) {
    // eslint-disable-next-line no-console
    console.log('GOV (dev) > Dev mode ON')
    const { address: govAddress } = getDeployment(
      chainId,
      'UnlockProtocolGovernor'
    )
    // eslint-disable-next-line no-console
    console.log(`GOV (dev) > gov contract: ${govAddress}`)

    // eslint-disable-next-line no-console
    console.log('GOV (dev) > gov voting period to 50 blocks')
    await network.provider.send('hardhat_setStorageAt', [
      govAddress,
      '0x1c7', // '455' storage slot
      '0x0000000000000000000000000000000000000000000000000000000000000032', // 50 blocks
    ])

    // Authoritarian mode: delegate UDT to a single voter (aka dictator) to bypass quorum
    // NB: this has to be done *before* proposal submission's block height so votes get accounted for
    await addUDT(holder.address, quorum * 2)

    // eslint-disable-next-line no-console
    console.log(`GOV (dev) > added 30k UDT to account ${holder.address}`)

    const { address: udtAddress, abi: udtAbi } = getDeployment(
      chainId,
      'UnlockDiscountTokenV3'
    )
    const udt = await new ethers.Contract(udtAddress, udtAbi, holder)

    // delegate 30k to voter
    const tx = await udt.delegate(dictator.address)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'DelegateVotesChanged')
    if (evt) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV VOTE (dev) > ${holder.address} delegated quorum to ${dictator.address}`,
        `(total votes: ${ethers.utils.formatUnits(
          await udt.getVotes(dictator.address),
          18
        )})`
      )
    }

    // eslint-disable-next-line no-console
    console.log(
      `GOV VOTE (dev) > Dictator votes: ${ethers.utils.formatUnits(
        await udt.getVotes(dictator.address),
        18
      )}`
    )
    await time.advanceBlock()
  }

  // Run the gov workflow
  const proposalId = await submit(proposal)
  await vote({ proposalId }) // no voter address enables authoritarian mode
  // await votes', { proposal }) // show votes
  await queue({ proposal: { ...proposal, proposalId } })
  await execute({ proposal: { ...proposal, proposalId } })
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
