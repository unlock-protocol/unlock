/**
 * Pay fees to the bridge for all calls in a cross-call DAO tx after execution
 *
 * Usage:
 * export PROPOSAL_EXECUTION_TX=<0x ...>
 * yarn hardhat run scripts/bridge/bump.js --network mainnet
 *
 *
 */
const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const submitTx = require('../multisig/submitTx')
const { getXCalledEventsFromTx } = require('../../helpers/bridge')
const { fetchRelayerFee } = require('../../helpers/crossChain')

async function main({
  // if of the tx from the DAO proposal execution
  txId = process.env.PROPOSAL_EXECUTION_TX,
  // default to DAO executor multisig
  multisig = '0xEFF26E4Cf0a0e71B3c406A763dacB8875469cbb2',
} = {}) {
  if (!txId) {
    throw Error(
      `Missing txId. Please export PROPOSAL_EXECUTION_TX in your shell`
    )
  }
  const {
    dao: {
      governanceBridge: { connext: bridgeAddress },
    },
  } = await getNetwork()

  console.log(`Using multisig: ${multisig}`)

  const xCalls = await getXCalledEventsFromTx(txId)
  const transferIds = xCalls.map(({ transferId }) => transferId)

  console.log(`Transfers to bump: ${transferIds.length}
${transferIds.map((transferId) => `- ${transferId}`).join('\n')}`)

  // calculate relayer fee for each call/chains
  const fees = await Promise.all(
    xCalls.map(async (d) => {
      const { originDomain, destinationDomain } = d.params
      return await fetchRelayerFee({ originDomain, destinationDomain })
    })
  )

  console.log(
    `fees (in ETH): ${fees
      .map((fee) => ethers.formatEther(fee.toString()))
      .join(', ')}`
  )

  // calculate sum of fees
  const totalFee = fees.reduce((prev, curr) => prev + curr, 0n)
  console.log(`totalFee: ${ethers.formatEther(totalFee.toString())} ETH`)

  // parse calls
  const { interface } = await ethers.getContractAt(
    ['function bumpTransfer(bytes32 _transferId) payable'],
    bridgeAddress
  )
  const calls = transferIds.map((transferId, i) => ({
    functionName: 'bumpTransfer',
    functionArgs: [transferId],
    calldata: interface.encodeFunctionData('bumpTransfer', [transferId]),
    contractAddress: bridgeAddress,
    value: fees[i].toString(),
  }))

  // submit the calls to the multisig
  const txArgs = {
    safeAddress: multisig,
    tx: calls,
  }
  console.log(txArgs)

  const transactionId = await submitTx(txArgs)
  console.log(
    `TRANSFER > Submitted bump tx to multisig (id: ${transactionId}).`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
