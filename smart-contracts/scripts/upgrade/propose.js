const { ethers, network } = require('hardhat')

const multisigABI = require('../../test/helpers/ABIs/multisig.json')
const proxyABI = require('../../test/helpers/ABIs/proxy.json')

// TODO: make possible to switch to DAO
const unlockMultisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'

const confirmTx = async ({ signers, multisig, transactionId }) => {
  const txs = await Promise.all(
    signers.slice(1, 4).map(async (signerAddress) => {
      await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [signerAddress],
      })
      const balance = ethers.utils.hexStripZeros(
        ethers.utils.parseEther('1000')
      )
      await network.provider.send('hardhat_setBalance', [
        signerAddress,
        balance,
      ])

      const signer = await ethers.getSigner(signerAddress)

      const m = multisig.connect(signer)
      const tx = await m.confirmTransaction(transactionId, {
        gasLimit: 1200000,
      })
      return await tx.wait()
    })
  )
  const [lastTx] = txs.slice(-1)
  const { events, transactionHash } = lastTx
  const failure = events.find((v) => v.event === 'ExecutionFailure')
  const success = events.find((v) => v.event === 'Execution')

  if (failure) {
    // eslint-disable-next-line no-console
    console.log(
      `ERROR: Proposal ${transactionId} failed to execute (txid: ${transactionHash})`
    )
  } else if (success) {
    // eslint-disable-next-line no-console
    console.log(
      `Proposal ${transactionId} executed successfully (txid: ${transactionHash})`
    )
  }
}

const encodeUpgradeTxData = async ({ proxyAddress, implementation }) => {
  // build upgrade tx
  const proxy = await ethers.getContractAt(proxyABI, proxyAddress)
  const data = proxy.interface.encodeFunctionData('upgrade', [
    proxyAddress,
    implementation,
  ])
  return data
}

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, proxyAdminAddress, implementation }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const isDev = chainId === 31337
  // eslint-disable-next-line no-console
  if (isDev) console.log('Dev mode ON')

  // get multisig
  const multisig = await ethers.getContractAt(
    multisigABI,
    unlockMultisigAddress
  )
  const owners = await multisig.getOwners()

  // get proper credentials
  let issuer
  if (isDev) {
    // impersonate multisig owner
    issuer = await ethers.getSigner(owners[0])
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [issuer.address],
    })
    // give some ETH
    const balance = ethers.utils.hexStripZeros(ethers.utils.parseEther('1000'))
    await network.provider.send('hardhat_setBalance', [issuer.address, balance])
  } else {
    ;[issuer] = await ethers.getSigners()
  }

  // eslint-disable-next-line no-console
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

  // eslint-disable-next-line no-console
  console.log(
    `Upgrade submitted to multisig w transactionId : ${transactionId} (txid: ${transactionHash})`
  )

  if (isDev) {
    // reach concensus
    await confirmTx({ signers: owners, multisig, transactionId })
  }
  return transactionId
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
