const { ethers } = require('hardhat')
const { getProvider, safeServiceURLs } = require('./_helpers')
const oldMultisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig2.json')
const { networks } = require('@unlock-protocol/networks')

const SafeApiKit = require('@safe-global/api-kit').default

const errorLog = (txt) => console.log(`⚠️: ${txt}`)

async function main() {
  for (let chainId in networks) {
    if (chainId !== '31337') {
      let owners, policy
      const errors = []
      const { name, multisig } = networks[chainId]

      if (!multisig || chainId == '80001') {
        errors.push('Missing multisig')
      } else {
        const provider = await getProvider(chainId)

        // get Safe service
        const safeService = new SafeApiKit({
          chainId,
          txServiceUrl: safeServiceURLs[chainId] || null,
        })

        try {
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
        } catch (error) {
          errorLog(`Couldn't fetch pending txs: ${error.message}`)
        }

        if (chainId === 1) {
          const safe = new ethers.Contract(multisig, oldMultisigABI, provider)
          owners = await safe.getOwners()
          policy = await safe.required()
        } else {
          const safe = new ethers.Contract(multisig, multisigABI, provider)
          owners = await safe.getOwners()
          policy = await safe.getThreshold()
        }

        if (policy == 1) {
          errors.push('❌ Single policy owner!')
        }
        if (policy <= 2) {
          errors.push(`Low policy owner (${policy})`)
        }
      }

      if (errors.length) {
        console.log(`# ${name} (${chainId}) - ${multisig}`)
        if (policy && owners) {
          console.log(`${policy}/${owners.length} owners`)
        }
        errors.forEach((error) => errorLog(error))
        console.log(`----\n`)
      }
      // owners.forEach((o) => console.log(`- ${o}`))
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
