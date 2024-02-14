const { ethers } = require('hardhat')
const { ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')

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

  console.log(parsedLogs)
  const transferIds = parsedLogs
    .filter((e) => e !== null)
    .filter(({ name }) => name === 'XCalled')
    .map(({ args: [transferId] }) => transferId)

  return transferIds
}

async function main({
  txId = '0x12d380bb7f995930872122033988524727a9f847687eede0b4e1fb2dcb8fce68',
} = {}) {
  const transferIds = await getTransferIds(txId)

  console.log(`Transfers to bump: ${transferIds.length}
${transferIds.map((txId) => `- ${txId}`).join('\n')}`)

  // TODO: call the bridge to pay fees for all transfers at once
  // bridge.bump
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
