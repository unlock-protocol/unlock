/**
 * Execute an operation that is pending in the Delay Module
 * after bridge
 *
 * Usage:
 * yarn hardhat run scripts/bridge/execTx.js --network polygon
 *
 */

const { getDelayModule, logStatus, DelayMod } = require('../../helpers/bridge')
const { fetchDataFromTx } = require('../../helpers/tx')
const fs = require('fs-extra')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

// use cache file to gather tx hashes from calls
const filepath = './xcalled.tmp.json'

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

async function main({ delayModuleAddress, execute = true } = {}) {
  const { delayMod, currentNonce } = await getDelayModule(delayModuleAddress)

  console.log(`\n-------\n`)

  if (await fs.exists(filepath)) {
    // parse statuses from cache file
    const statuses = await fs.readJSON(filepath)
    const { id, name } = await getNetwork()

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
        fetchDataFromTx({ txHash: executedTransactionHash, abi: DelayMod })
      )
    )
    console.log(`${transfers.length} txs bridged to ${name} (${id}) \n`)
    transfers.map(({ transferId, ...status }, i) => {
      console.log(`#### [Connext bridged call ${i}]`)
      logStatus(transferId, status)
      const [nonce, hash] = dataFromChain[i]
      console.log(`Containing a \`TransactionAdded\` call to multisig (nonce: ${nonce}) 
hash: \`${hash}\`\n`)
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
      const txs = await Promise.all(
        dataFromChain.map(([, , to, value, data, operation]) =>
          delayMod.executeNextTx(to, value, data, operation)
        )
      )
      const receipts = await Promise.all(txs.map((tx) => tx.wait()))
      console.log(`Executed. Tx(s) : ${receipts.map(({ hash }) => hash)}`)
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
