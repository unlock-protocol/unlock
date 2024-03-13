// TODO: import from package!
// import { networks } from '@unlock-protocol/contracts'

export const UnlockSwapPurchaserABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'lock',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'srcToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'keyPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountInMax',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'uniswapRouter',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'swapCalldata',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
    ],
    name: 'swapAndCall',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
]
