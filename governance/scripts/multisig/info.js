const { ethers } = require('hardhat')
const { getProvider, safeServiceURLs } = require('./_helpers')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig2.json')
const { networks } = require('@unlock-protocol/networks')

const SafeApiKit = require('@safe-global/api-kit').default

const getMultigiInfo = async (chainId, multisig) => {
  const errors = []
  const provider = await getProvider(chainId)
  // get Safe service
  const safeService = new SafeApiKit({
    chainId,
    txServiceUrl: safeServiceURLs[chainId] || null,
  })

  const { count } = await safeService.getPendingTransactions(multisig)
  if (count) {
    errors.push(`${count} pending txs are waiting to be signed`)
  }
  // the flags to get only un-executed transactions does not work
  // filed here https://github.com/safe-global/safe-core-sdk/issues/690
  // const allTxs = await safeService.getAllTransactions(multisig, {
  //   executed: false,
  //   trusted: false,
  //   queued: false,
  // })

  const safe = new ethers.Contract(multisig, multisigABI, provider)
  const owners = await safe.getOwners()
  const policy = await safe.getThreshold()
  if (!multisig) {
    errors.push('Missing multisig')
  } else {
    if (policy == 1) {
      errors.push('❌ Single policy owner!')
    }
    if (policy <= 2 || policy / BigInt(owners.length) > 1.5) {
      errors.push(`Low policy owner (${policy}/${owners.length})`)
    }
  }
  return errors
}

const log = (name, chainId, msg) =>
  console.log(`[${name} (${chainId})]: ${msg}`)

async function main() {
  for (let chainId in networks) {
    let errors
    if (chainId === 31337) return
    const { multisig, name } = networks[chainId]

    try {
      errors = await getMultigiInfo(chainId, multisig)
    } catch (error) {
      errors = [`Couldn't fetch multisig info: ${error.message}`]
    }
    errors.forEach((error) => log(name, chainId, error))
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
