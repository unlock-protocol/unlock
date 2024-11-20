export const allowListHookAbi = [
  { inputs: [], name: 'NOT_AUTHORIZED', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'lockAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
    ],
    name: 'MerkleRootSet',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: 'proof', type: 'bytes' },
    ],
    name: 'keyPurchasePrice',
    outputs: [
      { internalType: 'uint256', name: 'minKeyPrice', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'onKeyPurchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'roots',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
    ],
    name: 'setMerkleRootForLock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
