const { ethers } = require('hardhat')
const { impersonate } = require('./mainnet')

const multisigABI = require('./ABIs/multisig.json')
const UNLOCK_MULTISIG_ADDRESS = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'
const MULTISIG_ADDRESS_OWNER = '0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44'

// test helper to reach concensus on multisig
const confirmMultisigTx = async ({ transactionId }) => {
  const multisig = await ethers.getContractAt(
    multisigABI,
    UNLOCK_MULTISIG_ADDRESS
  )
  const signers = await multisig.getOwners()
  const txs = await Promise.all(
    signers.slice(1, 4).map(async (signerAddress) => {
      await impersonate(signerAddress)
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

module.exports = {
  confirmMultisigTx,
  UNLOCK_MULTISIG_ADDRESS,
  MULTISIG_ADDRESS_OWNER,
}
