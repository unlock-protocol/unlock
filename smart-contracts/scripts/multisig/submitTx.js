const { ethers } = require('hardhat')
const { getSafe } = require('./_helpers')

async function main({ safeAddress, tx, signer }) {
  if (!signer) {
    ;[signer] = await ethers.getSigners()
  }

  // get safe
  const safe = await getSafe({ safeAddress, signer })

  // encode contract call
  const { contractName, contractAddress, functionName, functionArgs } = tx

  const { interface } = await ethers.getContractFactory(contractName)
  const encodedFunctionCall = interface.encodeFunctionData(
    functionName,
    functionArgs
  )

  // submit to safe
  const txSubmitted = await safe.submitTransaction(
    contractAddress,
    0, // ETH value
    encodedFunctionCall
  )

  // submit to multisig
  const receipt = await txSubmitted.wait()
  const { transactionHash, events } = receipt
  const nonce = events
    .find(({ event }) => event === 'Submission')
    .args.transactionId.toNumber()
  console.log(
    `Tx submitted to multisig with id '${nonce}' (txid: ${transactionHash})`
  )
  return nonce
}

module.exports = main
