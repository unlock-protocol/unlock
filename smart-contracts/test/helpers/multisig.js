const { ethers, network } = require('hardhat')
const { impersonate, getEvent } = require('@unlock-protocol/hardhat-helpers')

const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const UNLOCK_MULTISIG_ADDRESS = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
const MULTISIG_ADDRESS_OWNER = '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a'

// test helper to reach concensus on multisig
const confirmMultisigTx = async ({
  transactionId,
  multisigAddress = UNLOCK_MULTISIG_ADDRESS,
}) => {
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)
  const signers = await multisig.getOwners()
  const txs = await Promise.all(
    signers.slice(1, 4).map(async (signerAddress) => {
      const signer = await impersonate(signerAddress)
      const m = multisig.connect(signer)
      const tx = await m.confirmTransaction(transactionId, {
        gasLimit: 1200000,
      })
      return await tx.wait()
    })
  )
  const [receipt] = txs.slice(-1)
  const { transactionHash } = receipt
  const failure = await getEvent(receipt, 'ExecutionFailure')
  const success = await getEvent(receipt, 'Execution')

  if (failure) {
    console.log(
      `ERROR: Proposal ${transactionId} failed to execute (txid: ${transactionHash})`
    )
  } else if (success) {
    console.log(
      `Proposal ${transactionId} executed successfully (txid: ${transactionHash})`
    )
  }
}

const getMultisigSigner = async (multisigAddress = UNLOCK_MULTISIG_ADDRESS) => {
  // update contract implementation address in proxy admin using multisig
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)

  const signers = await multisig.getOwners()
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [signers[0]],
  })
  const issuer = await ethers.getSigner(signers[0])
  return issuer
}

module.exports = {
  confirmMultisigTx,
  getMultisigSigner,
  UNLOCK_MULTISIG_ADDRESS,
  MULTISIG_ADDRESS_OWNER,
}
