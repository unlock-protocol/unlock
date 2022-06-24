const { ethers } = require('hardhat')
const proxyABI = require('./ABIs/proxy.json')

const { confirmMultisigTx, impersonate } = require('../../test/helpers')

const { getSafe, getOwners } = require('../multisig')

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, proxyAdminAddress, implementation }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  if (isDev) console.log('Dev mode ON')

  // get proper credentials
  const owners = await getOwners(chainId)
  let signer
  if (isDev) {
    // impersonate multisig owner
    signer = await ethers.getSigner(owners[0])
    await impersonate(owners[0])
  } else {
    ;[signer] = await ethers.getSigners()
  }
  console.log(`Signer: ${signer.address}`)

  // build upgrade tx
  const { interface } = new ethers.Contract(proxyABI, proxyAddress)
  const data = interface.encodeFunctionData('upgrade', [
    proxyAddress,
    implementation,
  ])

  // submit proxy upgrade tx to proxyAdmin
  const multisig = getSafe({ signer })
  const tx = await multisig.submitTransaction(
    proxyAdminAddress,
    0, // ETH value
    data
  )

  // get tx id
  const { events, transactionHash } = await tx.wait()
  const { transactionId } = events.find((v) => v.event === 'Submission')

  console.log(
    `Upgrade submitted to multisig w transactionId : ${transactionId.toNumber()} (txid: ${transactionHash})`
  )

  // make sure it doesnt revert
  if (isDev) {
    await confirmMultisigTx({ transactionId })
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
