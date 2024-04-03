module.exports = [
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
