import { UNLIMITED_KEYS_COUNT } from '../../../../lib/constants'
// Locks to deploy for each version

export default {
  v0: [
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: null, // Not supported in v0
      currencyContractAddress: null, // Not supported in v0
    },
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: null, // Not supported in v0
      currencyContractAddress: null, // Not supported in v0
    },
  ],
  v01: [
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: '', // Not set when created, defaults to '' in the contract
      currencyContractAddress: null, // Not supported in v01
    },
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: '', // Not set when created, defaults to '' in the contract
      currencyContractAddress: null, // Not supported in v01
    },
  ],
  v02: [
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: '', // Not set when created
      currencyContractAddress: null, // Not supported in v02
    },
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: '', // Not set when created in v02
      currencyContractAddress: null, // Not supported in v02
    },
  ],
  v10: [
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      currencyContractAddress: null, // Ether lock
    },
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      currencyContractAddress: null, // Ether lock
    },
    {
      expirationDuration: 60 * 60 * 24 * 10,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46', // ERC20 deployed in docker container
    },
  ],
  v11: [
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      currencyContractAddress: null,
    },
    {
      expirationDuration: 60 * 60 * 24 * 30,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      currencyContractAddress: null,
    },
    {
      expirationDuration: 60 * 60 * 24 * 10,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46', // ERC20 deployed in docker container
    },
  ],
  v12: [],
}
