const { run, ethers, network } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { addUDT, getDictator } = require('../../test/helpers/mainnet')

async function main({ proposal, govAddress, udtAddress }) {
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

    const udt = await new ethers.Contract(
      udtAddress,
      'UnlockDiscountTokenV3',
      holder
    )

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
  await run('gov:submit', { proposal, govAddress })
  await run('gov:vote', { proposal, govAddress }) // no voter address enables authoritarian mode
  await run('gov:votes', { proposal, govAddress }) // show votes
  // await run('gov:queue', { proposal })
  // await run('gov:execute', { proposal })
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
