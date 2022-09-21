const locksArgs = (tokenAddress: string) => [
  {
    expirationDuration: 300,
    keyPrice: '100000000',
    maxNumberOfKeys: 10,
    tokenAddress: null,
    name: 'ETH Lock',
  },
  {
    expirationDuration: 60,
    keyPrice: '100000000',
    maxNumberOfKeys: 10,
    tokenAddress,
    name: 'ERC20 Lock',
  },
]

export default locksArgs
