const { ethers } = require('hardhat')
const { mine } = require('@nomicfoundation/hardhat-network-helpers')
const { getQuorum, getGovTokenAddress } = require('../../helpers/gov')
const { parseXCalledEvents } = require('../../helpers/bridge')
const { addUDT, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')
const { default: networks } = require('@unlock-protocol/networks')

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
    ;({ proposalId } = await submit({ proposal, govAddress }))
  }

  // votes
  await vote({ proposalId, govAddress, voterAddress: signer.address })

  const udtWhales = [
    '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9', // Unlock Labs
    '0xF5C28ce24Acf47849988f147d5C75787c0103534', // unlock-protocol.eth
    '0xc0948A2f0B48A2AA8474f3DF54FD7C364225AD7d', // @_Cryptosmonitor
    '0xD2BC5cb641aE6f7A880c3dD5Aee0450b5210BE23', // stellaachenbach.eth
    '0xCA7632327567796e51920F6b16373e92c7823854', // dannithomx.eth
  ]
  await Promise.all(
    udtWhales.map((voterAddress) =>
      vote({ proposalId, govAddress, voterAddress })
    )
  )

  // Run the gov workflow
  await queue({ proposalId, proposal, govAddress, txId })
  const { logs } = await execute({ proposalId, txId, proposal, govAddress })

  // log all events
  console.log(logs)

  const xCalled = await parseXCalledEvents(logs)

  // decode xcall
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  await Promise.all(
    xCalled.map(({ transferId, params: { callData, destinationDomain } }) => {
      console.log(`------- Connext transfer ${transferId}`)

      const {
        name,
        id,
        governanceBridge: {
          modules: { delayMod, connextMod },
        },
      } = Object.values(networks).find((network) =>
        network.governanceBridge
          ? network.governanceBridge.domainId.toString() ==
            destinationDomain.toString()
          : false
      )
      console.log(
        `To simulate results on receiving end - chain ${name} (${id})
        - call \`execTransactionFromModule\` on contract ${delayMod} with from set as ${connextMod}
        - wait for cooldown period (default: +172800)
        - call \`executeNexTx\` on contract ${delayMod} with from set as ${connextMod}
        `
      )
      const [
        to, // to
        value, // value
        data, // data
        operation, // operation: 0 for CALL, 1 for DELEGATECALL
      ] = abiCoder.decode(['address', 'uint256', 'bytes', 'bool'], callData)

      console.log({
        to, // to
        value, // value
        data, // data
        operation,
      })
    })
  )
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
