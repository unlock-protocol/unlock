export const KickbackAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
    ],
    name: 'approveRefunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'issuedRefunds',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lockAddress', type: 'address' },
      { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'refund',
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
]

export default KickbackAbi
