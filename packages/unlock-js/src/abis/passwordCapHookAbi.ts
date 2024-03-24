export const passwordCapHookAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'NOT_AUTHORIZED', type: 'error' },
  { inputs: [], name: 'WRONG_PASSWORD', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'counters',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'message', type: 'string' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'getSigner',
    outputs: [
      { internalType: 'address', name: 'recoveredAddress', type: 'address' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
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
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'onKeyPurchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lock', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'uint256', name: 'usages', type: 'uint256' },
    ],
    name: 'setSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'signers',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]
