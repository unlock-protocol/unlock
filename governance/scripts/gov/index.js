const { ethers } = require('hardhat')
const { mine } = require('@nomicfoundation/hardhat-network-helpers')
const { getQuorum, getGovTokenAddress } = require('../../helpers/gov')
const { addUDT } = require('@unlock-protocol/hardhat-helpers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')

// workflow
const submit = require('./submit')
const vote = require('./vote')
const queue = require('./queue')
const execute = require('./execute')

async function main({ proposal, govAddress }) {
  const [signer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  const quorum = await getQuorum(govAddress)
  const udtAddress = await getGovTokenAddress(govAddress)

  // lower voting period on mainnet
  if (chainId === 31337 || process.env.RUN_FORK) {
    // eslint-disable-next-line no-console
    console.log(`GOV (dev) > gov contract: ${govAddress}`)

    // NB: this has to be done *before* proposal submission's block height so votes get accounted for
    console.log(
      `GOV (dev) > Delegating UDT to bypass quorum (udt: ${udtAddress})`
    )

    const udt = await ethers.getContractAt(
      UnlockDiscountTokenV2.abi,
      udtAddress
    )
    await addUDT(signer.address, quorum.mul(2), udt)

    // delegate 30k to voter
    const tx = await udt.delegate(signer.address)

    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'DelegateVotesChanged')
    if (evt) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV VOTE (dev) > ${signer.address} delegated quorum to ${signer.address}`,
        `(total votes: ${ethers.utils.formatEther(
          await udt.getVotes(signer.address)
        )},quorum: ${ethers.utils.formatEther(quorum)})`
      )
    }

    // mine 10 blocks
    await mine(10)
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
