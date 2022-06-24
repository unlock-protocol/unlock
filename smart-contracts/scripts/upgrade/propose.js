const { ethers } = require('hardhat')

const {
  getUnlockMultisig,
  confirmMultisigTx,
  encodeUpgradeTxData,
  impersonate,
} = require('../../test/helpers')

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, proxyAdminAddress, implementation }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337

  if (isDev) console.log('Dev mode ON')

  // TODO: make possible to switch to DAO
  const multisig = await getUnlockMultisig()
  const owners = await multisig.getOwners()

  // get proper credentials
  let issuer
  if (isDev) {
    // impersonate multisig owner
    issuer = await ethers.getSigner(owners[0])
    await impersonate(owners[0])
  } else {
    ;[issuer] = await ethers.getSigners()
  }

  console.log(`Issuer: ${issuer.address}`)

  // build upgrade tx
  const encodedTxData = await encodeUpgradeTxData({
    proxyAddress,
    implementation,
  })

  // submit proxy upgrade tx
  const tx = await multisig.connect(issuer).submitTransaction(
    proxyAdminAddress,
    0, // ETH value
    encodedTxData
  )

  // get tx id
  const { events, transactionHash } = await tx.wait()
  const evt = events.find((v) => v.event === 'Confirmation')
  const transactionId = evt.args[1]

  console.log(
    `Upgrade submitted to multisig w transactionId : ${transactionId} (txid: ${transactionHash})`
  )

  if (isDev) {
    // reach concensus
    await confirmMultisigTx({ transactionId })
  }
  return transactionId
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
