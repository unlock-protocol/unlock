/**
 * Pay fees to the bridge for all calls in a cross-call DAO tx after execution
 *
 * Usage:
 * yarn hardhat run scripts/bridge/bump.js --network mainnet
 *
 * TODO:
 * - pass `multisig` and `txId` as args
 *
 */
const { ethers } = require('hardhat')
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')
const submitTx = require('../multisig/submitTx')

const xCalledABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transferId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'uint32',
            name: 'originDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'destinationDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'canonicalDomain',
            type: 'uint32',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'delegate',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'receiveLocal',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'slippage',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'originSender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'bridgedAmt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'normalizedIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'canonicalId',
            type: 'bytes32',
          },
        ],
        indexed: false,
        internalType: 'struct TransferInfo',
        name: 'params',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'local',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'messageBody',
        type: 'bytes',
      },
    ],
    name: 'XCalled',
    type: 'event',
  },
]

const bumpTransferABI = [
  'function bumpTransfer(bytes32 _transferId) payable',
  'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData) payable returns (bytes32)',
]

const getTransferIds = async (hash) => {
  const { interface } = await ethers.getContractAt(xCalledABI, ADDRESS_ZERO)
  const { logs } = await ethers.provider.getTransactionReceipt(hash)
  const parsedLogs = logs.map((log) => {
    try {
      return interface.parseLog(log)
    } catch (error) {
      return {}
    }
  })

  const xCalled = parsedLogs
    .filter((e) => e !== null)
    .filter(({ name }) => name === 'XCalled')
    .map(({ args }) => args)

  return xCalled
}

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
  txId = '0x12d380bb7f995930872122033988524727a9f847687eede0b4e1fb2dcb8fce68',
  multisig = '0xEFF26E4Cf0a0e71B3c406A763dacB8875469cbb2',
} = {}) {
  const {
    governanceBridge: { connext: bridgeAddress },
  } = await getNetwork()

  console.log(`Using multisig: ${multisig}`)

  const xCalls = await getTransferIds(txId)
  const transferIds = xCalls.map(({ transferId }) => transferId)

  console.log(`Transfers to bump: ${transferIds.length}
${transferIds.map((transferId) => `- ${transferId}`).join('\n')}`)

  // parse bump fee calls
  const bridge = await ethers.getContractAt(bumpTransferABI, bridgeAddress)

  // calculate relayer fee for each call/chains
  const fees = await Promise.all(
    xCalls.map(async (d) => {
      const { originDomain, destinationDomain } = d.params
      return await fetchRelayerFee({ originDomain, destinationDomain })
    })
  )

  console.log(fees)
  console.log(
    `fees (in ETH): ${fees
      .map((fee) => ethers.formatEther(fee.toString()))
      .join(', ')}`
  )

  // calculate sum of fees
  const totalFee = fees.reduce((prev, curr) => prev + curr, 0n)
  console.log(totalFee)
  console.log(`totalFee: ${ethers.formatEther(totalFee.toString())} ETH`)

  // parse calls
  const calls = transferIds.map((transferId) => ({
    calldata: bridge.interface.encodeFunctionData('bumpTransfer', [transferId]),
    contractAddress: bridgeAddress,
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
