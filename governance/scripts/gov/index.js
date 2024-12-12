/**
 * Runs a simulation for the entire cycle of a proposal
 * from submission, voting, etc to cross-chain simulation
 * using Tenderly
 */
const { ethers } = require('hardhat')
const { mine } = require('@nomicfoundation/hardhat-network-helpers')
const { getQuorum, getGovTokenAddress } = require('../../helpers/gov')
const { parseXCalledEvents } = require('../../helpers/bridge')
const { simulateDestCalls } = require('../../helpers/crossChain')
const {
  addUDT,
  getEvent,
  addSomeETH,
  impersonate,
  getERC20Contract,
} = require('@unlock-protocol/hardhat-helpers')
const {
  Unlock,
  PublicLock,
  UnlockDiscountTokenV2,
  UniswapOracleV3,
} = require('@unlock-protocol/contracts')
const l1BridgeAbi = require('../../helpers/abi/l1standardbridge.json')

// workflow
const submit = require('./submit')
const vote = require('./vote')
const queue = require('./queue')
const execute = require('./execute')

// parse logs
const parseLogs = (
  logs,
  showAll = false,
  abi = [
    ...Unlock.abi,
    ...PublicLock.abi,
    ...UniswapOracleV3.abi,
    ...l1BridgeAbi,
  ]
) => {
  const interface = new ethers.Interface(abi)

  // parse logs
  const parsedLogs = logs.map((log, i) => {
    try {
      const parsed = interface.parseLog(log)
      log = parsed || { ...log, decodedError: true }
    } catch (error) {
      log.decodedError = true
    }
    return log
  })
  const toShow = showAll
    ? parsedLogs
    : parsedLogs.filter(({ decodedError }) => !decodedError)

  console.log(toShow)
  console.log(`Logs not decoded: ${parsedLogs.length - toShow.length}`)
  return toShow
}

async function main({ proposal, proposalId, govAddress, txId }) {
  const [signer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()

  console.log(proposal.proposalName)
  const quorum = await getQuorum(govAddress)
  const udtAddress = await getGovTokenAddress(govAddress)

  if (process.env.RUN_FORK == 8453) {
    // fund timelock for testing execution
    const BASE_TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'
    await addSomeETH(BASE_TIMELOCK_ADDRESS)

    // fund 50k UP to make sure we can send a proposal
    const holder = '0x3074517c5F5428f42C74543C68001E0Ca86FE7dd'
    await impersonate(holder)
    const up = await getERC20Contract(
      '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
    )
    const [signer] = await ethers.getSigners()
    await up
      .connect(await ethers.getSigner(holder))
      .transfer(await signer.getAddress(), ethers.parseEther('51000'))
  }

  // lower voting period on mainnet
  if (chainId === 31337 || process.env.RUN_FORK) {
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
    const { event } = await getEvent(
      receipt,
      chainId === 8453n ? 'DelegateChanged' : 'DelegateVotesChanged'
    )
    if (event) {
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
  parseLogs(logs)

  // simulate bridge calls
  const xCalled = await parseXCalledEvents(logs)
  await simulateDestCalls(xCalled)
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
