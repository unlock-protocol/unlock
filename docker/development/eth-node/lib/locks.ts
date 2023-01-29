const locksArgs = (currencyContractAddress: string) => [
  {
    expirationDuration: 300,
    keyPrice: '100000000',
    maxNumberOfKeys: 10,
    currencyContractAddress: null,
    name: 'ETH Lock',
  },
  {
    expirationDuration: 60,
    keyPrice: '100000000',
    maxNumberOfKeys: 10,
    currencyContractAddress,
    name: 'ERC20 Lock',
  },
]

export default locksArgs
