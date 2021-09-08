module.exports = params => {
  return [
    {
      expirationDuration: 300,
      keyPrice: '0.01',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH Lock',
    },
    {
      expirationDuration: 60,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: params.erc20Address,
      name: 'ERC20 Lock',
    },
    {
      expirationDuration: 300,
      keyPrice: '0.1',
      maxNumberOfKeys: '1000',
      currencyContractAddress: null,
      name: 'ETH paywall lock',
    },
    {
      expirationDuration: 300,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: params.erc20Address,
      name: 'ERC20 paywall lock',
    },
    {
      expirationDuration: 604800,
      keyPrice: '0.01',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 1',
    },
    {
      expirationDuration: 2592000,
      keyPrice: '0.05',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 2',
    },
    {
      expirationDuration: 31536000,
      keyPrice: '0.1',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 3',
    },
    {
      expirationDuration: 604800,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: params.erc20Address,
      name: 'ERC20 adblock lock 1',
    },
    {
      expirationDuration: 2592000,
      keyPrice: '5',
      maxNumberOfKeys: -1,
      currencyContractAddress: params.erc20Address,
      name: 'ERC20 adblock lock 2',
    },
    {
      expirationDuration: 31536000,
      keyPrice: '100',
      maxNumberOfKeys: -1,
      currencyContractAddress: params.erc20Address,
      name: 'ERC20 adblock lock 3',
    },
  ]
}
