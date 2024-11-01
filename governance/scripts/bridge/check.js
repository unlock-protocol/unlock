const { targetChains, DelayMod: delayModAbi } = require('../../helpers/bridge')
const { getProvider } = require('../../helpers/multisig')
const { Contract } = require('ethers')

const isExpired = async (delayMod, nonce) => {
  const createdAt = await delayMod.getFunction('getTxCreatedAt')(nonce)
  const expiration = await delayMod.getFunction('txExpiration')()
  const deadline = createdAt + expiration
  const now = BigInt(parseInt(Date.now() / 1000))
  return deadline < now
}

async function main() {
  for (let i in targetChains) {
    const {
      id,
      name,
      dao: {
        governanceBridge: {
          modules: { delayMod: delayModAddress },
        },
      },
    } = targetChains[i]
    const log = (msg) => console.log(`[${name} (${id})] ${msg}`)
    // parse Delay contract
    const provider = await getProvider(id)
    const delayMod = new Contract(delayModAddress, delayModAbi, provider)

    // get nonces
    const currentNonce = await delayMod.txNonce()
    const nextNonce = await delayMod.queueNonce()

    // check if any pending txs
    if (currentNonce !== nextNonce) {
      // check if tx is expired
      const length = parseInt((nextNonce - currentNonce).toString())
      log(`${length} pending txs in delay module (${delayModAddress})`)
      const nonces = Array(length)
        .fill(0)
        .map((_, i) => BigInt(`${i}`) + currentNonce)
      const expired = await Promise.all(
        nonces.map((nonce) => isExpired(delayMod, nonce))
      )
      const expiredTxCount = expired.filter((x) => x).length
      if (expiredTxCount > 0) {
        log(
          `${expiredTxCount} expired txs in delay module (${delayModAddress})`
        )
      }
    }
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
