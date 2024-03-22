const { ethers } = require('hardhat')
const { mine } = require('@nomicfoundation/hardhat-network-helpers')
const { getQuorum, getGovTokenAddress } = require('../../helpers/gov')
const { addUDT, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')

// workflow
const submit = require('./submit')
const vote = require('./vote')
const queue = require('./queue')
const execute = require('./execute')

async function main({ proposal, proposalId, govAddress, txId }) {
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
    await addUDT(signer.address, quorum * BigInt(2), udt)

    // delegate 30k to voter
    const tx = await udt.delegate(signer.address)

    const receipt = await tx.wait()
    const { event, hash } = await getEvent(receipt, 'DelegateVotesChanged')
    if (event) {
      // eslint-disable-next-line no-console
      console.log(
        `GOV VOTE (dev) > ${signer.address} delegated quorum to ${signer.address}`,
        `(total votes: ${ethers.formatEther(
          await udt.getVotes(signer.address)
        )},quorum: ${ethers.formatEther(quorum)})`
      )
    }

    // mine 10 blocks
    await mine(10)
  }

  // Submit the proposal if necessary
  if (!proposalId) {
    proposalId = await submit({ proposal, govAddress })
  }

  // Run the gov workflow
  await vote({ proposalId, govAddress, voterAddress: signer.address })
  await queue({ proposalId, govAddress, txId })
  await execute({ proposalId, txId, proposal, govAddress })
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
