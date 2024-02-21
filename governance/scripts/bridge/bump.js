/**
 * Pay fees to the bridge for all calls in a cross-call DAO tx after execution
 *
 * Usage:
 * yarn hardhat run scripts/bridge/bump.js --network mainnet
 *
 * TODO:
 * - make cli task to pass args
 *
 */
const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const submitTx = require('../multisig/submitTx')
const { getXCalledEvents } = require('./_lib')

const fetchRelayerFee = async ({ originDomain, destinationDomain }) => {
  const res = await fetch(
    'https://sdk-server.mainnet.connext.ninja/estimateRelayerFee',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originDomain: originDomain.toString(),
        destinationDomain: destinationDomain.toString(),
      }),
    }
  )
  const { hex } = await res.json()
  return BigInt(hex)
}

async function main({
  // TODO: pass this hash via cli
  txId = '0x12d380bb7f995930872122033988524727a9f847687eede0b4e1fb2dcb8fce68',
  // default to DAO executor multisig
  multisig = '0xEFF26E4Cf0a0e71B3c406A763dacB8875469cbb2',
} = {}) {
  const {
    governanceBridge: { connext: bridgeAddress },
  } = await getNetwork()

  console.log(`Using multisig: ${multisig}`)

  const xCalls = await getXCalledEvents(txId)
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
    value: fees[i],
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
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
