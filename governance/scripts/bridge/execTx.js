/**
 * Execute an operation that is pending in the Delay Module
 * after bridge
 *
 * Usage:
 * yarn hardhat run scripts/bridge/execTx.js --network polygon
 *
 */

const {
  getDelayModule,
  fetchDataFromTx,
  logStatus,
} = require('../../helpers/bridge')
const fs = require('fs-extra')
const { resolve } = require('path')
const { ethers } = require('hardhat')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

const { loadProposal } = require('../../helpers/gov')

// use cache file to gather tx hashes from calls
const filepath = './xcalled.json.tmp'

const bigIntToDate = (num) => new Date(parseInt((num * 1000n).toString()))

const getTxStatus = async (delayMod, nonce) => {
  const hash = await delayMod.getTxHash(nonce)
  const createdAt = await delayMod.txCreatedAt(nonce)
  const cooldown = await delayMod.txCooldown()
  const expiration = await delayMod.txExpiration()
  return {
    nonce,
    hash,
    createdAt,
    cooldown: createdAt + cooldown,
    expiration: createdAt + expiration,
  }
}

const explain = (explainers, args) => {
  const exp = explainers.find(
    ({ contractAddress, calldata }) =>
      contractAddress === args[0] && calldata === args[2]
  )
  return `to: \`${exp.contractAddress}\` 
func: \`${exp.explainer}\``
}

async function main({
  delayModuleAddress,
  bridgeTxHash,
  execute = false,
} = {}) {
  const { delayMod, currentNonce } = await getDelayModule(delayModuleAddress)
  if (typeof bridgeTxHash) {
    bridgeTxHash = [bridgeTxHash]
  }

  console.log(`\n-------\n`)

  if (await fs.exists(filepath)) {
    // parse statuses from cache file
    const statuses = await fs.readJSON(filepath)
    const {
      id,
      name,
      governanceBridge: { domainId },
    } = await getNetwork()

    // get original proposal to organize calls in correct order
    const proposalPath = resolve('./proposals/009-protocol-upgrade')
    const { calls, explainers: allExplainers } = await loadProposal(
      proposalPath
    )
    const explainers = allExplainers[id]

    // unpack calls from proposal
    const proposalCalls = calls.filter(
      ({ calldata, functionArgs }) => !calldata && functionArgs[0] === domainId
    )

    // compute expected tx hashes from proposal data
    const abiCoder = ethers.AbiCoder.defaultAbiCoder()
    const computedFromProposal = await Promise.all(
      proposalCalls
        .map((call) =>
          // decode args from proposal
          abiCoder.decode(
            ['address', 'uint256', 'bytes', 'bool'],
            call.functionArgs[6]
          )
        )
        .map(async (a) => {
          // compute expected hash from proposal args
          let args = a.toArray()
          // parse bool as uint
          args[3] = args[3] ? 1n : 0n
          const hash = await delayMod.getTransactionHash(...args)
          return { hash, args }
        })
    )

    console.log(
      `${
        proposalCalls.length
      } bridge calls sent to ${name} in the original proposal
${computedFromProposal
  .map(
    ({ hash, args }, i) =>
      `[${i}]: 
expected hash: \`${hash}\`
${explain(explainers, args)}\n`
  )
  .join('\n')}`
    )
    console.log(`\n-------\n`)

    // pick bridged calls statuses only for the current chain
    const transfers = Object.keys(statuses)
      .reverse()
      .map((transferId) => ({
        transferId,
        ...statuses[transferId],
      }))
      .filter(({ dest }) => dest.chainId == id)

    const dataFromChain = await Promise.all(
      transfers.map(({ dest: { executedTransactionHash } }) =>
        fetchDataFromTx({ txHash: executedTransactionHash })
      )
    )
    console.log(`${transfers.length} txs bridged to ${name} (${id}) \n`)
    transfers.map(({ transferId, ...status }, i) => {
      console.log(`#### [Connext bridged call ${i}]`)

      logStatus(transferId, status)
      const [nonce, hash, ...args] = dataFromChain[i]
      console.log(`Containing a \`TransactionAdded\` call to multisig (nonce: ${nonce}) 
hash: \`${hash}\`
${explain(explainers, args)}\n`)
    })
    console.log(`\n-------\n`)

    // get tx hash from nonce
    const txHashesFromNonce = await Promise.all(
      transfers.map((_, i) => getTxStatus(delayMod, currentNonce + BigInt(i)))
    )

    console.log(
      `Txs present in the Delay module at ${await delayMod.getAddress()}:\n`,
      txHashesFromNonce
        .map(
          ({ hash, createdAt, cooldown, expiration, nonce }) => `
    ${hash} (nonce: ${nonce})
    - createdAt: ${bigIntToDate(createdAt)} (${createdAt})
    - cooldown: ${bigIntToDate(cooldown)}
    - expiration: ${bigIntToDate(expiration)}`
        )
        .join(`\n`)
    )

    // execute all
    if (execute) {
      // await delayMod.executeNextTx(...execArgs)
    }

    // to cancel use `setTxNonce(queueNonce)` from the multisig
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
