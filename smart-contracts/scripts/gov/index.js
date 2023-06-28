const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')
const { addUDT } = require('../../test/helpers')
const { getQuorum, getGovTokenAddress } = require('../../helpers/gov')

// workflow
const submit = require('./submit')
const vote = require('./vote')
const queue = require('./queue')
const execute = require('./execute')

async function main({ proposal, govAddress }) {
  const [signer, holder] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  const quorum = await getQuorum(govAddress)
  const udtAddress = getGovTokenAddress(govAddress)

  // lower voting period on mainnet
  if (chainId === 31337 || process.env.RUN_FORK) {
    // eslint-disable-next-line no-console
    console.log(`GOV (dev) > gov contract: ${govAddress}`)

    // NB: this has to be done *before* proposal submission's block height so votes get accounted for
    console.log('GOV (dev) > Delegating UDT to bypass quorum')
    await addUDT(holder.address, ethers.utils.formatEther(quorum.mul(2)))

    const udt = await ethers.getContractAt(
      'UnlockDiscountTokenV3',
      udtAddress,
      holder
    )

    // delegate 30k to voter
    const tx = await udt.delegate(signer.address)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'DelegateVotesChanged')
    if (evt) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV VOTE (dev) > ${holder.address} delegated quorum to ${signer.address}`,
        `(total votes: ${ethers.utils.formatEther(
          await udt.getVotes(signer.address)
        )},quorum: ${ethers.utils.formatEther(quorum)})`
      )
    }

    await time.advanceBlock()
  }

  // Run the gov workflow
  const proposalId = await submit({ proposal, govAddress })
  await vote({ proposalId, govAddress, voterAddress: signer.address })
  await queue({ proposal, govAddress })
  await execute({ proposal, govAddress })
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
