import { UNLIMITED_KEYS_COUNT } from '../../../../lib/constants'
// Locks to deploy for each version

export default {
  v4: [
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
      currencyContractAddress: '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9', // ERC20 deployed in docker container
    },
  ],
  v5: [
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
      currencyContractAddress: '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9', // ERC20 deployed in docker container
    },
  ],
  v6: [
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
      currencyContractAddress: '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9', // ERC20 deployed in docker container
    },
  ],
  v7: [
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
      currencyContractAddress: '0xFcD4FD1B4F3d5ceDdc19004579A5d7039295DBB9', // ERC20 deployed in docker container
    },
  ],
}
