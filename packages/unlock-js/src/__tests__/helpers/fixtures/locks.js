import { UNLIMITED_KEYS_COUNT } from '../../../constants'
// Locks to deploy for each version

const THIRTY_DAYS = 60 * 60 * 24 * 30
const TEN_DAYS = 60 * 60 * 24 * 10

export default {
  v9: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v10: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v11: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v12: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v13: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v14: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
  v15: [
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: 100,
      name: 'My Lock',
      isERC20: false,
    },
    {
      expirationDuration: THIRTY_DAYS,
      keyPrice: '0.1',
      maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
      name: 'Unlimited Keys lock',
      isERC20: false,
    },
    {
      expirationDuration: TEN_DAYS,
      keyPrice: '1',
      maxNumberOfKeys: 100,
      name: 'ERC20 lock',
      isERC20: true,
    },
  ],
}
