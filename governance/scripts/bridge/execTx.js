/**
 * Execute an operation that is pending in the Delay Module
 * after bridge
 *
 * Usage:
 * yarn hardhat run scripts/bridge/execTx.js --network polygon
 *
 */

const { getDelayModule, fetchDataFromTx, logStatus } = require('./_lib')
const fs = require('fs-extra')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

// use cache file to gather tx hashes from calls
const filepath = './xcalled.json.tmp'

const bigIntToDate = (num) => new Date(parseInt((num * 1000n).toString()))

const getTxStatus = async ({ delayMod, txHash, nextNonce } = {}) => {
  const currentNonce = nextNonce - 1n
  const { to, value, data, operation } = await fetchDataFromTx({ txHash })

  // make sure tx is scheduled correctly
  const txHashExec = await delayMod.getTransactionHash(
    to,
    value,
    data,
    operation
  )

  // verify tx hash from nonce
  const txHashFromNonce = await delayMod.getTxHash(currentNonce)
  if (txHashFromNonce !== txHashExec) {
    console.error(`tx mismatch`)
    console.error({ txHashFromNonce, txHashExec })
  }

  const createdAt = await delayMod.txCreatedAt(currentNonce)
  const cooldown = await delayMod.txCooldown()
  const expiration = await delayMod.txExpiration()

  return {
    execArgs: [to, value, data, operation],
    createdAt,
    cooldown: createdAt + cooldown,
    expiration: createdAt + expiration,
    nonce: currentNonce,
  }
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

  if (await fs.exists(filepath)) {
    // parse statuses from cache file
    const statuses = await fs.readJSON(filepath)
    const { id } = await getNetwork()

    // prune calls only for the current chain
    const transfers = Object.keys(statuses)
      .map((transferId) => ({
        transferId,
        ...statuses[transferId],
      }))
      .filter(({ dest }) => dest.chainId == id)
    console.log(`${transfers.length} calls`)

    // get info on calls from multisig
    let nonce = currentNonce
    const txs = await Promise.all(
      transfers.map(async ({ dest: { executedTransactionHash } }) => {
        nonce++ // increment nonce
        return await getTxStatus({
          delayMod,
          txHash: executedTransactionHash,
          nextNonce: nonce,
        })
      })
    )

    transfers.forEach((transfer, i) => {
      console.log('----------------------\n')
      logStatus(transfer.transferId, transfer)
      const { createdAt, cooldown, expiration } = txs[i]
      console.log(
        `Status on the multisig delay mod
    - createdAt: ${bigIntToDate(createdAt)}
    - cooldown: ${bigIntToDate(cooldown)}
    - expiration: ${bigIntToDate(expiration)}
        `
      )
    })

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
