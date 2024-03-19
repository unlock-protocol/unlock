const { ethers } = require('hardhat')
const { getProvider, safeServiceURLs } = require('./_helpers')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig2.json')
const { networks } = require('@unlock-protocol/networks')

const SafeApiKit = require('@safe-global/api-kit').default

const prodSigners = [
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x4011d09a86D0acA8377a4A8baD691F1ACeeCd672', // nf
  '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212', // aa
  '0xccb5D94FbfBFDc4953Ca8a114f88773C2fF98e80', // sm
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
].sort()

const devSigners = [
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
].sort()

const getMultiSigInfo = async (chainId, multisig) => {
  const errors = []
  const { isTestNetwork } = networks[chainId]
  const expectedSigners = isTestNetwork ? devSigners : prodSigners
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

  if (!multisig) {
    errors.push('Missing multisig')
  } else {
    const safe = new ethers.Contract(multisig, multisigABI, provider)
    const owners = await safe.getOwners()
    const policy = await safe.getThreshold()

    if (isTestNetwork && policy < 2) {
      errors.push('❌ Policy below 2!')
    }
    if (!isTestNetwork && policy < 4) {
      errors.push(
        `❌ Unexpected policy: ${policy}/${owners.length} for 4/${expectedSigners.length} expected`
      )
    }

    let extraSigners = owners.filter((x) => !expectedSigners.includes(x))
    if (extraSigners.length > 0) {
      errors.push(`❌ Extra signers: ${[...extraSigners].sort()}`)
    }

    let missingSigners = expectedSigners.filter((x) => !owners.includes(x))
    if (missingSigners.length > 0) {
      errors.push(`❌ Missing signers: ${missingSigners}`)
    }
  }
  return errors
}

const log = (name, chainId, multisig, msg) =>
  console.log(`[${name} (${chainId})]: ${multisig} ${msg}`)

async function main() {
  for (let chainId in networks) {
    let errors
    if (chainId === 31337) return
    const { multisig, name } = networks[chainId]

    try {
      errors = await getMultiSigInfo(chainId, multisig)
    } catch (error) {
      errors = [`Couldn't fetch multisig info: ${error.message}`]
    }
    errors.forEach((error) => log(name, chainId, multisig, error))
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
